import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPurchasedFromArtist, isFollowingArtist } from "@/lib/eligibility";

/** Tells the client whether the current fan can comment on this artist's feed posts ("Paid Voice"). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ loggedIn: false, following: false, purchased: false, canComment: false });
  }

  const [following, purchased] = await Promise.all([
    isFollowingArtist(session.user.id, id),
    hasPurchasedFromArtist(session.user.id, id),
  ]);

  return NextResponse.json({
    loggedIn: true,
    following,
    purchased,
    canComment: following && purchased,
  });
}
