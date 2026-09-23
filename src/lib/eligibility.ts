import { prisma } from "@/lib/prisma";

/** Whether a fan has purchased at least one item from this artist (any order item, incl. 0-won PWYW). */
export async function hasPurchasedFromArtist(userId: string, artistId: string): Promise<boolean> {
  const count = await prisma.orderItem.count({
    where: {
      product: { artistId },
      order: { buyerUserId: userId },
    },
  });
  return count > 0;
}

export async function isFollowingArtist(userId: string, artistId: string): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: { userId_artistId: { userId, artistId } },
  });
  return Boolean(follow);
}

export async function isSubscribedToArtist(userId: string, artistId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId_artistId: { userId, artistId } },
  });
  return Boolean(sub);
}

/** "Paid Voice" gate: must follow the artist AND have purchased at least one item from them. */
export async function canCommentOnArtist(userId: string, artistId: string): Promise<boolean> {
  const [following, purchased] = await Promise.all([
    isFollowingArtist(userId, artistId),
    hasPurchasedFromArtist(userId, artistId),
  ]);
  return following && purchased;
}

/**
 * Batched purchase/subscription lookup across many artists at once — used by the global
 * "followed artists" feed, which spans one page of posts from potentially many different
 * artists, so checking each artist one at a time would be an N+1 query per page load.
 */
export async function getEligibilityForArtists(
  userId: string,
  artistIds: string[],
): Promise<{ purchased: Set<string>; subscribed: Set<string> }> {
  if (artistIds.length === 0) return { purchased: new Set(), subscribed: new Set() };

  const [orderItems, subscriptions] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order: { buyerUserId: userId }, product: { artistId: { in: artistIds } } },
      select: { product: { select: { artistId: true } } },
    }),
    prisma.subscription.findMany({
      where: { userId, artistId: { in: artistIds } },
      select: { artistId: true },
    }),
  ]);

  return {
    purchased: new Set(orderItems.map((i) => i.product.artistId)),
    subscribed: new Set(subscriptions.map((s) => s.artistId)),
  };
}
