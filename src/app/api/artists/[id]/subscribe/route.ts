import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ tier: null });
  }
  const sub = await prisma.subscription.findUnique({
    where: { userId_artistId: { userId: session.user.id, artistId: id } },
  });
  return NextResponse.json({ tier: sub?.tier ?? null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 구독할 수 있어요." }, { status: 401 });
  }
  const { tier } = await req.json();
  if (tier !== "MONTHLY" && tier !== "YEARLY") {
    return NextResponse.json({ error: "tier must be MONTHLY or YEARLY" }, { status: 400 });
  }

  const sub = await prisma.subscription.upsert({
    where: { userId_artistId: { userId: session.user.id, artistId: id } },
    update: { tier },
    create: { userId: session.user.id, artistId: id, tier },
  });
  return NextResponse.json({ tier: sub.tier });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 구독을 해지할 수 있어요." }, { status: 401 });
  }
  await prisma.subscription
    .delete({ where: { userId_artistId: { userId: session.user.id, artistId: id } } })
    .catch(() => {});
  return NextResponse.json({ tier: null });
}
