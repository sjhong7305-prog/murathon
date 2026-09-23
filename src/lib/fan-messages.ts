import { prisma } from "@/lib/prisma";

export interface FanMessageView {
  orderId: string;
  buyerNickname: string;
  cheerMessage: string | null;
  promptQuestion: string | null;
  promptAnswer: string | null;
  paidPrice: number;
  createdAt: string;
  product: { id: string; title: string; imageUrl: string | null; coverColor: string };
}

/**
 * Real purchase-linked fan messages for one artist — an Order counts as a "message" when it
 * carries a cheer message or a Q&A answer. The representative product/price shown is the first
 * OrderItem in that order that actually belongs to this artist (an order can span artists).
 */
export async function getArtistFanMessages(artistId: string): Promise<FanMessageView[]> {
  const orders = await prisma.order.findMany({
    where: {
      items: { some: { product: { artistId } } },
      OR: [{ cheerMessage: { not: null } }, { promptAnswer: { not: null } }],
    },
    include: {
      items: {
        where: { product: { artistId } },
        include: { product: { select: { id: true, title: true, imageUrl: true, coverColor: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders
    .filter((order) => order.items.length > 0)
    .map((order) => {
      const item = order.items[0];
      return {
        orderId: order.id,
        buyerNickname: order.name,
        cheerMessage: order.cheerMessage,
        promptQuestion: order.promptQuestion,
        promptAnswer: order.promptAnswer,
        paidPrice: item.price * item.quantity,
        createdAt: order.createdAt.toISOString(),
        product: {
          id: item.product.id,
          title: item.product.title,
          imageUrl: item.product.imageUrl,
          coverColor: item.product.coverColor,
        },
      };
    });
}
