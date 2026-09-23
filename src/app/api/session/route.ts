import { NextResponse } from "next/server";
import { getSession, getActiveArtistId } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ isLoggedIn: false });

  const { user } = session;
  const activeArtistId = await getActiveArtistId(user);

  return NextResponse.json({
    isLoggedIn: true,
    userId: user.id,
    nickname: user.nickname,
    email: user.email,
    artists: user.artistMemberships.map((m) => ({
      id: m.artist.id,
      name: m.artist.name,
      slug: m.artist.slug,
    })),
    activeArtistId,
  });
}
