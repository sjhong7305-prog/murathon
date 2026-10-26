import { NextRequest, NextResponse } from "next/server";
import { getSession, setActiveArtistCookie } from "@/lib/auth";

/** Header "channel switch" — point the session at one of the caller's own artist profiles, or back to fan mode. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { artistId } = await req.json();
  const isMember = session.user.artistMemberships.some((m) => m.artistId === artistId);
  if (!isMember) {
    return NextResponse.json({ error: "본인 소유의 아티스트 페이지가 아니에요." }, { status: 403 });
  }

  await setActiveArtistCookie(artistId);
  return NextResponse.json({ activeArtistId: artistId });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  await setActiveArtistCookie(null);
  return NextResponse.json({ activeArtistId: null });
}
