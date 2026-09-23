import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNoticeById } from "@/lib/artist-notices";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; noticeId: string }> }) {
  const { id, noticeId } = await params;
  const session = await getSession();
  const isOwner = Boolean(session?.user.artistMemberships.some((m) => m.artistId === id));

  const notice = await getNoticeById(id, noticeId, session?.user.id ?? null, isOwner);
  if (!notice) {
    return NextResponse.json({ error: "공지를 찾을 수 없어요." }, { status: 404 });
  }
  return NextResponse.json(notice);
}
