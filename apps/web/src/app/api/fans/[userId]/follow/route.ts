import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 팔로우할 수 있어요." }, { status: 401 });
  }
  if (session.user.id === userId) {
    return NextResponse.json({ error: "자기 자신은 팔로우할 수 없어요." }, { status: 400 });
  }
  await prisma.fanFollow.upsert({
    where: { followerUserId_followingUserId: { followerUserId: session.user.id, followingUserId: userId } },
    update: {},
    create: { followerUserId: session.user.id, followingUserId: userId },
  });
  return NextResponse.json({ following: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 팔로우를 해제할 수 있어요." }, { status: 401 });
  }
  await prisma.fanFollow
    .delete({
      where: { followerUserId_followingUserId: { followerUserId: session.user.id, followingUserId: userId } },
    })
    .catch(() => {});
  return NextResponse.json({ following: false });
}
