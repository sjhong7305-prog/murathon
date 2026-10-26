import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos-storage";
import { processTrackCoverUpload, ImageValidationError } from "@/lib/artist-image-pipeline";

/** Cover art for a self-service track release upload — one image per request, same pipeline shape as the feed image route. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 업로드할 수 있어요." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "이미지 파일이 필요해요." }, { status: 400 });
  }

  try {
    const buffer = await processTrackCoverUpload(file);
    const filename = `${id}-${randomUUID()}.webp`;
    const uploaded = await uploadToCos("tracks", new Blob([new Uint8Array(buffer)]), filename);
    return NextResponse.json({ url: uploaded.url });
  } catch (err) {
    if (err instanceof ImageValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
