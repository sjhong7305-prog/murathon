import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/cos-storage";
import { FEED_VIDEO_ALLOWED_MIME, FEED_VIDEO_ALLOWED_EXT } from "@/lib/artist-feed-constants";

/**
 * Issues a presigned COS PUT URL for a video file — the browser uploads directly to COS with it,
 * so a 500MB file never passes through (or gets buffered by) the Next.js server. Only extension +
 * declared Content-Type are checked here; there's no ffmpeg in this project to actually decode and
 * verify the codec server-side, so (unlike images, which get a real sharp decode) a determined
 * client could still lie about content past this check. Client-side size validation is the primary
 * guard against oversized files — a presigned PUT URL from this SDK doesn't carry a size cap.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 게시할 수 있어요." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const filename = typeof body?.filename === "string" ? body.filename : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";

  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : "";
  if (!FEED_VIDEO_ALLOWED_EXT.includes(ext) || !FEED_VIDEO_ALLOWED_MIME.includes(contentType)) {
    return NextResponse.json({ error: "mp4, webm, mov 영상만 업로드할 수 있어요." }, { status: 400 });
  }

  const key = `${id}-${randomUUID()}${ext}`;
  const presigned = await getPresignedUploadUrl("feed", key, contentType);
  return NextResponse.json(presigned);
}
