import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/guest-cart";
import { getSession } from "@/lib/auth";
import { validatePrice } from "@/lib/price-validation";

interface OrderItemInput {
  productId: string;
  artistId: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const items: OrderItemInput[] = body.items ?? [];
  const listAsSupporter: boolean = Boolean(body.listAsSupporter);
  const primaryArtistId: string | undefined = body.primaryArtistId;
  const name = session.user.nickname;
  const email = session.user.email;

  const cart = await getOrCreateCart();

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { artist: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "존재하지 않는 상품이 포함되어 있어요." }, { status: 400 });
    }
    if (product.status === "UNPUBLISHED") {
      return NextResponse.json(
        { error: `"${product.title}"은(는) 판매가 종료되어 주문할 수 없어요.` },
        { status: 400 }
      );
    }
    const validation = validatePrice(item.price, product.minPrice);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    item.price = validation.price;
  }
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        name,
        email,
        guestId: cart.guestId,
        buyerUserId: session.user.id,
        cheerMessage: body.cheerMessage || null,
        promptQuestion: body.promptQuestion || null,
        promptAnswer: body.promptAnswer || null,
        listAsSupporter,
        primaryArtistId: primaryArtistId || null,
        total,
        items: {
          create: items.map((item) => {
            const product = productById.get(item.productId);
            return {
              productId: item.productId,
              titleSnapshot: product?.title ?? "",
              artistNameSnapshot: product?.artist.name ?? "",
              price: item.price,
              quantity: item.quantity,
            };
          }),
        },
      },
    });

    if (listAsSupporter && primaryArtistId && name.trim()) {
      await tx.supporter.upsert({
        where: { artistId_nickname: { artistId: primaryArtistId, nickname: name.trim() } },
        update: {},
        create: { artistId: primaryArtistId, nickname: name.trim() },
      });
    }
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const mine = searchParams.get("mine");

  if (productId) {
    const cart = await getOrCreateCart();
    const session = await getSession();
    const count = await prisma.orderItem.count({
      where: {
        productId,
        order: {
          OR: [
            { guestId: cart.guestId },
            ...(session ? [{ buyerUserId: session.user.id }] : []),
          ],
        },
      },
    });
    return NextResponse.json({ hasPurchased: count > 0 });
  }

  if (mine) {
    const cart = await getOrCreateCart();
    const session = await getSession();
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          OR: [
            { guestId: cart.guestId },
            ...(session ? [{ buyerUserId: session.user.id }] : []),
          ],
        },
      },
      include: { order: true, product: true },
      orderBy: { order: { createdAt: "asc" } },
    });
    return NextResponse.json(
      orderItems.map((item) => ({
        productId: item.productId,
        artistId: item.product.artistId,
        price: item.price,
        quantity: item.quantity,
        purchasedAt: item.order.createdAt,
      }))
    );
  }

  return NextResponse.json({ error: "productId or mine is required" }, { status: 400 });
}
