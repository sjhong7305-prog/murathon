import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getArtistFanMessages } from "@/lib/fan-messages";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 볼 수 있어요." }, { status: 403 });
  }

  const messages = await getArtistFanMessages(id);
  return NextResponse.json(messages);
}
