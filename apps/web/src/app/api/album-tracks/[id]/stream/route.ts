import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAlbumTrackStreamGrant } from "@/lib/stream-auth";

/** Full-vs-preview playback for one album track, decided server-side from the parent album's purchase status. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const grant = await getAlbumTrackStreamGrant(id, session?.user.id ?? null);
  if (!grant) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(grant);
}
