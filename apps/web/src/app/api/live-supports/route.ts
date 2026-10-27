import { NextResponse } from "next/server";
import { getRecentSupports } from "@/lib/data";

/** Polled by the home LIVE ticker. Same privacy rules as getRecentSupports (no email/user id/message). */
export async function GET() {
  try {
    const supports = await getRecentSupports(20);
    return NextResponse.json(supports, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
