import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStreamGrant } from "@/lib/stream-auth";

/** Full-vs-preview playback decision, made server-side so unowned tracks never leak a full-length URL. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const grant = await getStreamGrant(id, session?.user.id ?? null);
  if (!grant) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(grant);
}
