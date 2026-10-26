import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/guest-cart";

/** Create or update the current fan's "why I bought this" note on a product they purchased. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 남길 수 있어요." }, { status: 401 });
  }

  const { productId, message } = await req.json();
  const trimmed = String(message ?? "").trim();
  if (!productId || !trimmed) {
    return NextResponse.json({ error: "productId and message are required" }, { status: 400 });
  }

  const cart = await getOrCreateCart();
  const purchased = await prisma.orderItem.count({
    where: {
      productId,
      order: { OR: [{ buyerUserId: session.user.id }, { guestId: cart.guestId }] },
    },
  });
  if (purchased === 0) {
    return NextResponse.json({ error: "구매한 상품에만 서포터 코멘트를 남길 수 있어요." }, { status: 403 });
  }

  const note = await prisma.supporterNote.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { message: trimmed },
    create: { userId: session.user.id, productId, message: trimmed },
  });

  return NextResponse.json({ productId: note.productId, message: note.message, updatedAt: note.updatedAt });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 삭제할 수 있어요." }, { status: 401 });
  }
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  await prisma.supporterNote
    .delete({ where: { userId_productId: { userId: session.user.id, productId } } })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}
