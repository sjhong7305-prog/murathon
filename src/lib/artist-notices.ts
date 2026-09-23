import { prisma } from "@/lib/prisma";
import { hasPurchasedFromArtist, isSubscribedToArtist } from "@/lib/eligibility";
import type { ArtistPostVisibility, Prisma } from "@prisma/client";

const NOTICE_TITLE_FALLBACK_LENGTH = 40;

export interface NoticeMediaView {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  position: number;
}

export interface NoticeListItemView {
  id: string;
  title: string;
  pinned: boolean;
  visibility: ArtistPostVisibility;
  hasImage: boolean;
  sentAt: string;
}

export interface NoticeDetailView extends NoticeListItemView {
  artistId: string;
  artistName: string;
  artistSlug: string;
  message: string;
  media: NoticeMediaView[];
}

const listSelect = {
  id: true,
  title: true,
  message: true,
  visibility: true,
  pinned: true,
  sentAt: true,
  _count: { select: { media: true } },
} satisfies Prisma.BroadcastSelect;

type RawListRow = Prisma.BroadcastGetPayload<{ select: typeof listSelect }>;

function displayTitle(row: { title: string | null; message: string }): string {
  const trimmed = row.title?.trim();
  if (trimmed) return trimmed;
  const flat = row.message.replace(/\s+/g, " ").trim();
  return flat.length > NOTICE_TITLE_FALLBACK_LENGTH ? `${flat.slice(0, NOTICE_TITLE_FALLBACK_LENGTH)}…` : flat;
}

function toListItem(row: RawListRow): NoticeListItemView {
  return {
    id: row.id,
    title: displayTitle(row),
    pinned: row.pinned,
    visibility: row.visibility,
    hasImage: row._count.media > 0,
    sentAt: row.sentAt.toISOString(),
  };
}

/** Home-tab notice box — PUBLIC notices only, unconditionally, regardless of viewer eligibility (even the owner's own SUPPORTER/SUBSCRIBER notices never show here). */
export async function getArtistNoticeBox(artistId: string, limit: number = 3): Promise<NoticeListItemView[]> {
  const rows = await prisma.broadcast.findMany({
    where: { artistId, visibility: "PUBLIC" },
    select: listSelect,
    orderBy: [{ pinned: "desc" }, { sentAt: "desc" }],
    take: limit,
  });
  return rows.map(toListItem);
}

/** Full /artists/[slug]/notices listing — eligibility-filtered, same gating rule as the feed. */
export async function getArtistNoticeList(
  artistId: string,
  viewerUserId: string | null,
  isOwner: boolean,
  limit: number = 50
): Promise<NoticeListItemView[]> {
  let purchased = false;
  let subscribed = false;
  if (viewerUserId && !isOwner) {
    [purchased, subscribed] = await Promise.all([
      hasPurchasedFromArtist(viewerUserId, artistId),
      isSubscribedToArtist(viewerUserId, artistId),
    ]);
  }

  const visibilityWhere: Prisma.BroadcastWhereInput = isOwner
    ? {}
    : {
        OR: [
          { visibility: "PUBLIC" },
          ...(purchased ? [{ visibility: "SUPPORTER" as const }] : []),
          ...(subscribed ? [{ visibility: "SUBSCRIBER" as const }] : []),
        ],
      };

  const rows = await prisma.broadcast.findMany({
    where: { artistId, ...visibilityWhere },
    select: listSelect,
    orderBy: [{ pinned: "desc" }, { sentAt: "desc" }],
    take: limit,
  });
  return rows.map(toListItem);
}

/**
 * Single notice, eligibility-checked. Returns null for "doesn't exist" and "exists but you're
 * not eligible" alike — deliberately indistinguishable, so a locked notice's existence never
 * leaks to an ineligible caller (same principle as the feed's server-side gating).
 */
export async function getNoticeById(
  artistId: string,
  noticeId: string,
  viewerUserId: string | null,
  isOwner: boolean
): Promise<NoticeDetailView | null> {
  const row = await prisma.broadcast.findUnique({
    where: { id: noticeId },
    include: {
      artist: { select: { id: true, name: true, slug: true } },
      media: { orderBy: { position: "asc" } },
    },
  });
  if (!row || row.artistId !== artistId) return null;

  if (!isOwner && row.visibility !== "PUBLIC") {
    const eligible =
      row.visibility === "SUPPORTER"
        ? viewerUserId && (await hasPurchasedFromArtist(viewerUserId, artistId))
        : viewerUserId && (await isSubscribedToArtist(viewerUserId, artistId));
    if (!eligible) return null;
  }

  return {
    id: row.id,
    title: displayTitle(row),
    pinned: row.pinned,
    visibility: row.visibility,
    hasImage: row.media.length > 0,
    sentAt: row.sentAt.toISOString(),
    artistId: row.artist.id,
    artistName: row.artist.name,
    artistSlug: row.artist.slug,
    message: row.message,
    media: row.media.map((m) => ({ id: m.id, url: m.url, width: m.width, height: m.height, position: m.position })),
  };
}
