import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createPlaylist, listMyPlaylists } from "@/lib/playlists";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const playlists = await listMyPlaylists(session.user.id);
  return NextResponse.json(playlists);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const result = await createPlaylist(session.user.id, {
    title: String(body.title ?? ""),
    description: body.description ? String(body.description) : undefined,
    coverUrl: body.coverUrl ? String(body.coverUrl) : undefined,
    isPublic: Boolean(body.isPublic),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: 201 });
}
