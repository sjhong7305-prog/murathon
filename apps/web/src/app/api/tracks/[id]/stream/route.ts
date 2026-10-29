import { NextRequest, NextResponse } from "next/server";
import { getUploadedTrackStreamGrant } from "@/lib/stream-auth";

/** Preview playback for a standalone uploaded track, for the global player. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grant = await getUploadedTrackStreamGrant(id);
  if (!grant) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(grant);
}
