import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";

/** Whether the current fan has liked this release. Logged-out visitors simply get `false`. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ liked: false });

  const like = await prisma.productLike.findUnique({
    where: { userId_productId: { userId: session.user.id, productId: id } },
  });
  return NextResponse.json({ liked: Boolean(like) });
}

/** Sets the like to `{ liked }` (idempotent, so a double tap can't flip it back). */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인해야 좋아요를 누를 수 있어요." }, { status: 401 });
  }

  const { liked } = await req.json();
  const key = { userId_productId: { userId: session.user.id, productId: id } };
  if (liked) {
    const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    await prisma.productLike.upsert({
      where: key,
      update: {},
      create: { userId: session.user.id, productId: id },
    });
  } else {
    await prisma.productLike.delete({ where: key }).catch(() => {});
  }
  return NextResponse.json({ liked: Boolean(liked) });
}
