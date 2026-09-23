import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos-storage";
import { COVER_COLORS } from "@/lib/cover-colors";
import { processBannerUpload, ImageValidationError } from "@/lib/artist-image-pipeline";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 수정할 수 있어요." }, { status: 403 });
  }

  const formData = await req.formData();
  const name = formData.get("name");
  const genre = formData.get("genre");
  const introduction = formData.get("introduction");
  const coverColor = formData.get("coverColor");
  const snsLink = formData.get("snsLink");
  const bannerFile = formData.get("bannerImage");

  const data: Record<string, string> = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof genre === "string") data.genre = genre.trim();
  if (typeof introduction === "string") data.introduction = introduction.trim();
  if (typeof coverColor === "string" && COVER_COLORS.includes(coverColor)) data.coverColor = coverColor;
  if (typeof snsLink === "string") data.snsLink = snsLink.trim();

  if (bannerFile instanceof File && bannerFile.size > 0) {
    try {
      const buffer = await processBannerUpload(bannerFile);
      const filename = `${id}-banner-${randomUUID()}.webp`;
      const uploaded = await uploadToCos("artists", new Blob([new Uint8Array(buffer)]), filename);
      data.bannerImage = uploaded.url;
    } catch (err) {
      if (err instanceof ImageValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  }

  const artist = await prisma.artist.update({ where: { id }, data });

  return NextResponse.json({
    name: artist.name,
    genre: artist.genre,
    introduction: artist.introduction,
    coverColor: artist.coverColor,
    bannerImage: artist.bannerImage,
  });
}
