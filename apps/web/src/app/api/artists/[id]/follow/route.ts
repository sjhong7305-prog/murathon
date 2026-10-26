import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ following: false });
  }
  const follow = await prisma.follow.findUnique({
    where: { userId_artistId: { userId: session.user.id, artistId: id } },
  });
  return NextResponse.json({ following: Boolean(follow) });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 팔로우할 수 있어요." }, { status: 401 });
  }
  await prisma.follow.upsert({
    where: { userId_artistId: { userId: session.user.id, artistId: id } },
    update: {},
    create: { userId: session.user.id, artistId: id },
  });
  return NextResponse.json({ following: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 팔로우를 해제할 수 있어요." }, { status: 401 });
  }
  await prisma.follow
    .delete({ where: { userId_artistId: { userId: session.user.id, artistId: id } } })
    .catch(() => {});
  return NextResponse.json({ following: false });
}
