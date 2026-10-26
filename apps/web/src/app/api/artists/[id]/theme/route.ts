import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos-storage";
import { validateThemeInput, MAX_BIO_LENGTH } from "@muraton/shared/artist-theme";
import {
  processBannerUpload,
  processProfileImageUpload,
  processBackgroundImageUpload,
  ImageValidationError,
} from "@/lib/artist-image-pipeline";

async function uploadProcessedImage(id: string, kind: "banner" | "avatar" | "bg", buffer: Buffer): Promise<string> {
  const filename = `${id}-${kind}-${randomUUID()}.webp`;
  const uploaded = await uploadToCos("artists", new Blob([new Uint8Array(buffer)]), filename);
  return uploaded.url;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 수정할 수 있어요." }, { status: 403 });
  }

  const formData = await req.formData();
  const themeRaw = formData.get("theme");
  const introductionRaw = formData.get("introduction");
  const membershipEnabledRaw = formData.get("membershipEnabled");
  const bannerFile = formData.get("bannerImage");
  const profileFile = formData.get("profileImage");
  const backgroundFile = formData.get("backgroundImage");

  let parsedThemeInput: unknown;
  try {
    parsedThemeInput = JSON.parse(String(themeRaw ?? "null"));
  } catch {
    return NextResponse.json({ error: "테마 데이터 형식이 올바르지 않아요." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof introductionRaw === "string") {
    const introduction = introductionRaw.trim();
    if (introduction.length > MAX_BIO_LENGTH) {
      return NextResponse.json({ error: `소개는 ${MAX_BIO_LENGTH}자 이내로 작성해주세요.` }, { status: 400 });
    }
    data.introduction = introduction;
  }

  if (typeof membershipEnabledRaw === "string") {
    data.membershipEnabled = membershipEnabledRaw === "true";
  }

  try {
    if (bannerFile instanceof File && bannerFile.size > 0) {
      const buffer = await processBannerUpload(bannerFile);
      data.bannerImage = await uploadProcessedImage(id, "banner", buffer);
    }
    if (profileFile instanceof File && profileFile.size > 0) {
      const buffer = await processProfileImageUpload(profileFile);
      data.imageUrl = await uploadProcessedImage(id, "avatar", buffer);
    }

    let serverImageUrl: { imageUrl?: string; computedMeanColor?: string } | undefined;
    if (backgroundFile instanceof File && backgroundFile.size > 0) {
      const { buffer, meanColor } = await processBackgroundImageUpload(backgroundFile);
      const url = await uploadProcessedImage(id, "bg", buffer);
      serverImageUrl = { imageUrl: url, computedMeanColor: meanColor };
    }

    const result = validateThemeInput(parsedThemeInput, serverImageUrl);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    data.theme = result.theme;

    const artist = await prisma.artist.update({ where: { id }, data });

    return NextResponse.json({
      theme: artist.theme,
      introduction: artist.introduction,
      bannerImage: artist.bannerImage,
      imageUrl: artist.imageUrl,
      membershipEnabled: artist.membershipEnabled,
      contrastWarning: result.contrastWarning,
    });
  } catch (err) {
    if (err instanceof ImageValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
