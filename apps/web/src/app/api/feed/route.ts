import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFollowedArtistsFeedPage } from "@/lib/artist-feed";
import { FEED_PAGE_SIZE } from "@/lib/artist-feed-constants";

/** Chronological feed of posts from artists the viewer follows. Requires login. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const cursor = req.nextUrl.searchParams.get("cursor");
  const limitRaw = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 50 ? limitRaw : FEED_PAGE_SIZE;

  const page = await getFollowedArtistsFeedPage(session.user.id, cursor, limit);
  return NextResponse.json(page);
}
