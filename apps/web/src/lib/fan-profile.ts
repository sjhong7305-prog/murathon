import { prisma } from "@muraton/db";
import { formatReleaseLabel } from "@muraton/shared/release-label";

export type CollectionItemType = "ALBUM" | "TRACK" | "MERCH" | "TICKET";

export interface FanCollectionItem {
  productId: string;
  title: string;
  type: CollectionItemType;
  /** album/track only — "디지털 싱글" etc, via formatReleaseLabel(). */
  releaseLabel?: string;
  /** UNPUBLISHED = artist soft-deleted this release after purchase; the fan keeps legacy access. */
  status: "PUBLISHED" | "UNPUBLISHED";
  coverColor: string;
  imageUrl: string | null;
  artistId: string;
  artistName: string;
  artistSlug: string;
  price: number;
  quantity: number;
  purchasedAt: Date;
  note: { message: string; updatedAt: Date } | null;
  /** True when this album isn't a direct purchase but came bundled with a merch item. */
  viaBundle: boolean;
  shippingStatus?: "PAID" | "SHIPPING" | "DELIVERED";
  eventName?: string;
  venue?: string;
  eventAt?: Date;
  /** Stub admission info, only ever populated when the profile is fetched by its owner. */
  admissionCode?: string;
}

export interface CollectionCounts {
  all: number;
  music: number;
  merch: number;
  ticket: number;
}

export interface FollowedArtistSummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  coverColor: string;
}

export interface FanCollectionProfile {
  userId: string;
  nickname: string;
  email: string;
  privacy: "PUBLIC" | "PRIVATE";
  isOwner: boolean;
  followerCount: number;
  followingCount: number;
  viewerIsFollowing: boolean;
  private: boolean;
  items: FanCollectionItem[];
  counts: CollectionCounts;
  followedArtists: FollowedArtistSummary[];
}

function admissionCodeFor(orderItemId: string) {
  return `TICKET-${orderItemId.slice(0, 8).toUpperCase()}`;
}

type ReleaseLabelRow = {
  type: CollectionItemType;
  format: string | null;
  releaseType: string | null;
  releaseFormats: { format: string; price: number; stock: number | null; includesDigital: boolean; shippingRequired: boolean }[];
};

function releaseLabelFromRow(row: ReleaseLabelRow): string {
  return formatReleaseLabel({
    type: row.type.toLowerCase() as "album" | "track" | "merch" | "ticket",
    format: row.format ?? undefined,
    releaseType: row.releaseType?.toLowerCase() as "single" | "ep" | "album" | undefined,
    formats: row.releaseFormats.map((f) => ({
      id: "",
      format: f.format.toLowerCase() as "digital" | "cd" | "vinyl" | "cassette",
      price: f.price,
      stock: f.stock ?? undefined,
      includesDigital: f.includesDigital,
      shippingRequired: f.shippingRequired,
    })),
  });
}

export async function getFanCollectionProfile(
  userId: string,
  viewerUserId?: string | null
): Promise<FanCollectionProfile | null> {
  const isOwner = viewerUserId === userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [followerCount, followingCount, viewerFollowing] = await Promise.all([
    prisma.fanFollow.count({ where: { followingUserId: userId } }),
    prisma.fanFollow.count({ where: { followerUserId: userId } }),
    viewerUserId
      ? prisma.fanFollow.findUnique({
          where: { followerUserId_followingUserId: { followerUserId: viewerUserId, followingUserId: userId } },
        })
      : null,
  ]);

  const base = {
    userId,
    nickname: user.nickname,
    email: user.email,
    privacy: user.collectionPrivacy,
    isOwner,
    followerCount,
    followingCount,
    viewerIsFollowing: Boolean(viewerFollowing),
  };

  if (!isOwner && user.collectionPrivacy === "PRIVATE") {
    return { ...base, private: true, items: [], counts: { all: 0, music: 0, merch: 0, ticket: 0 }, followedArtists: [] };
  }

  const [orderItems, notes, follows] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order: { buyerUserId: userId } },
      include: {
        product: {
          include: {
            artist: true,
            releaseFormats: true,
            includedAlbum: { include: { artist: true, releaseFormats: true } },
          },
        },
        order: true,
      },
      orderBy: { order: { createdAt: "desc" } },
    }),
    prisma.supporterNote.findMany({ where: { userId } }),
    prisma.follow.findMany({ where: { userId }, include: { artist: true } }),
  ]);

  const noteByProductId = new Map(notes.map((n) => [n.productId, n]));
  const seenProductIds = new Set<string>();
  const items: FanCollectionItem[] = [];

  for (const item of orderItems) {
    if (item.product.type === "TICKET" && !isOwner) continue;

    if (!seenProductIds.has(item.productId)) {
      seenProductIds.add(item.productId);
      const note = noteByProductId.get(item.productId);
      items.push({
        productId: item.productId,
        title: item.product.title,
        type: item.product.type,
        releaseLabel: releaseLabelFromRow(item.product),
        status: item.product.status,
        coverColor: item.product.coverColor,
        imageUrl: item.product.imageUrl,
        artistId: item.product.artistId,
        artistName: item.product.artist.name,
        artistSlug: item.product.artist.slug,
        price: item.price,
        quantity: item.quantity,
        purchasedAt: item.order.createdAt,
        note: note ? { message: note.message, updatedAt: note.updatedAt } : null,
        viaBundle: false,
        shippingStatus: item.product.type === "MERCH" ? item.shippingStatus : undefined,
        eventName: item.product.eventName ?? undefined,
        venue: item.product.venue ?? undefined,
        eventAt: item.product.eventAt ?? undefined,
        admissionCode:
          item.product.type === "TICKET" && isOwner ? admissionCodeFor(item.id) : undefined,
      });
    }

    // Merch+album bundle: surface the included album under the music tab too, unless it's
    // already there as a direct purchase.
    const bundled = item.product.includedAlbum;
    if (bundled && !seenProductIds.has(bundled.id)) {
      seenProductIds.add(bundled.id);
      items.push({
        productId: bundled.id,
        title: bundled.title,
        type: bundled.type,
        releaseLabel: releaseLabelFromRow(bundled),
        status: bundled.status,
        coverColor: bundled.coverColor,
        imageUrl: bundled.imageUrl,
        artistId: bundled.artistId,
        artistName: bundled.artist.name,
        artistSlug: bundled.artist.slug,
        price: 0,
        quantity: 1,
        purchasedAt: item.order.createdAt,
        note: null,
        viaBundle: true,
      });
    }
  }

  const counts: CollectionCounts = {
    all: items.length,
    music: items.filter((i) => i.type === "ALBUM" || i.type === "TRACK").length,
    merch: items.filter((i) => i.type === "MERCH").length,
    ticket: items.filter((i) => i.type === "TICKET").length,
  };

  const followedArtists: FollowedArtistSummary[] = follows.map((f) => ({
    id: f.artist.id,
    name: f.artist.name,
    slug: f.artist.slug,
    imageUrl: f.artist.imageUrl,
    coverColor: f.artist.coverColor,
  }));

  return { ...base, private: false, items, counts, followedArtists };
}
