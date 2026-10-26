import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFanCollectionProfile } from "@/lib/fan-profile";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await getSession();

  const profile = await getFanCollectionProfile(userId, session?.user.id);
  if (!profile) {
    return NextResponse.json({ error: "존재하지 않는 팬이에요." }, { status: 404 });
  }
  return NextResponse.json(profile);
}
