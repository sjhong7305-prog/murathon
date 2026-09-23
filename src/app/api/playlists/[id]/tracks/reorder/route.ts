import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { reorderPlaylistTracks } from "@/lib/playlists";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const productIds = Array.isArray(body.productIds) ? body.productIds.map(String) : [];

  const result = await reorderPlaylistTracks(id, session.user.id, productIds);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
