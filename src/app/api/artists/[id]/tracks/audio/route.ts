import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos-storage";
import {
  MAX_TRACK_AUDIO_BYTES,
  TRACK_AUDIO_ALLOWED_MIME,
  TRACK_AUDIO_ALLOWED_EXT,
  TRACK_AUDIO_ALLOWED_LABEL,
} from "@/lib/track-upload-constants";

/**
 * Uploads the track's audio file for real (this used to be a client-only object URL that was
 * never actually persisted). Only extension + declared Content-Type are checked — same caveat as
 * the feed video presign route: there's no audio-decoding library in this project to verify the
 * codec server-side.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 업로드할 수 있어요." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "오디오 파일이 필요해요." }, { status: 400 });
  }
  if (file.size > MAX_TRACK_AUDIO_BYTES) {
    return NextResponse.json(
      { error: `오디오 파일은 ${MAX_TRACK_AUDIO_BYTES / (1024 * 1024)}MB 이하로 업로드해주세요.` },
      { status: 400 }
    );
  }

  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  if (!TRACK_AUDIO_ALLOWED_EXT.includes(ext) || !TRACK_AUDIO_ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: `${TRACK_AUDIO_ALLOWED_LABEL} 파일만 업로드할 수 있어요.` }, { status: 400 });
  }

  const filename = `${id}-${randomUUID()}${ext}`;
  const uploaded = await uploadToCos("tracks", file, filename);
  return NextResponse.json({ url: uploaded.url });
}
