import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getArtistNoticeBox, getArtistNoticeList } from "@/lib/artist-notices";

/**
 * Public read path for the notice board (home-tab box + /notices list) — no ownership check,
 * anyone can call it, but non-PUBLIC rows are filtered server-side per viewer (see artist-notices.ts).
 * Distinct from the owner-only management list at GET /api/artists/[id]/broadcasts.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const isOwner = Boolean(session?.user.artistMemberships.some((m) => m.artistId === id));

  const box = req.nextUrl.searchParams.get("box") === "1";
  const limitRaw = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100 ? limitRaw : box ? 3 : 50;

  const notices = box
    ? await getArtistNoticeBox(id, limit)
    : await getArtistNoticeList(id, session?.user.id ?? null, isOwner, limit);

  return NextResponse.json({ notices });
}
