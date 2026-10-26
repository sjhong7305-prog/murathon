import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getOrCreateCart } from "@/lib/guest-cart";
import { validatePrice } from "@/lib/price-validation";

async function serializedItems(cartId: string) {
  const items = await prisma.cartItem.findMany({ where: { cartId } });
  return items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity }));
}

export async function GET() {
  const cart = await getOrCreateCart();
  return NextResponse.json(await serializedItems(cart.id));
}

export async function POST(req: NextRequest) {
  const { productId, price, quantity = 1 } = await req.json();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { minPrice: true, status: true },
  });
  if (!product) {
    return NextResponse.json({ error: "상품을 찾을 수 없어요." }, { status: 404 });
  }
  if (product.status === "UNPUBLISHED") {
    return NextResponse.json({ error: "판매가 종료된 상품이에요." }, { status: 400 });
  }
  const validation = validatePrice(price, product.minPrice);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const cart = await getOrCreateCart();

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { price: validation.price, quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, price: validation.price, quantity },
    });
  }

  return NextResponse.json(await serializedItems(cart.id));
}

export async function PATCH(req: NextRequest) {
  const { productId, price, quantity } = await req.json();
  const cart = await getOrCreateCart();

  let validatedPrice: number | undefined;
  if (price !== undefined) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { minPrice: true } });
    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없어요." }, { status: 404 });
    }
    const validation = validatePrice(price, product.minPrice);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    validatedPrice = validation.price;
  }

  await prisma.cartItem.updateMany({
    where: { cartId: cart.id, productId },
    data: {
      ...(validatedPrice !== undefined ? { price: validatedPrice } : {}),
      ...(quantity !== undefined ? { quantity } : {}),
    },
  });

  return NextResponse.json(await serializedItems(cart.id));
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const cart = await getOrCreateCart();

  if (productId) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  } else {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return NextResponse.json(await serializedItems(cart.id));
}
