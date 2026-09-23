import { prisma } from "@/lib/prisma";
import { hasPurchasedFromArtist, isSubscribedToArtist, getEligibilityForArtists } from "@/lib/eligibility";
import { CATEGORY_LABEL } from "@/lib/artist-feed-labels";
import { FEED_PAGE_SIZE } from "@/lib/artist-feed-constants";
import type { ArtistPostCategory, ArtistPostVisibility, ArtistPostMediaType, Prisma } from "@prisma/client";

export interface FeedMediaView {
  id: string;
  type: ArtistPostMediaType;
  /** null when the viewer isn't eligible to see this post — never leaks past the server. */
  url: string | null;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  position: number;
}

export interface FeedPostView {
  id: string;
  artistId: string;
  artistName: string;
  artistSlug: string;
  artistImageUrl: string | null;
  /** Which band member posted — falls back to the artist's own name/image when the post (or the member's profile fields) has none set. Never gated by lock state, same tier as category/date. */
  authorMemberId: string | null;
  authorName: string;
  authorImageUrl: string | null;
  authorRoleLabel: string | null;
  category: string;
  categoryValue: ArtistPostCategory;
  createdAt: string;
  updatedAt: string;
  visibility: ArtistPostVisibility;
  locked: boolean;
  content: string | null;
  media: FeedMediaView[];
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
}

export interface FeedPage {
  posts: FeedPostView[];
  nextCursor: string | null;
}

const postInclude = {
  artist: { select: { id: true, name: true, slug: true, imageUrl: true } },
  authorMember: { select: { id: true, displayName: true, imageUrl: true, roleLabel: true } },
  media: { orderBy: { position: "asc" as const } },
  _count: { select: { comments: true, likes: true } },
} satisfies Prisma.ArtistPostInclude;

type RawPost = Prisma.ArtistPostGetPayload<{ include: typeof postInclude }>;

/**
 * Feed posts gated per viewer — ineligible viewers get the post's shell (category/date/type of
 * each media item, aspect ratio) so the feed still teases what exists, but never the real
 * content/media urls. Same "server decides, then reveals" principle used for audio stream grants.
 */
function toView(p: RawPost, eligible: boolean, likedPostIds: Set<string>): FeedPostView {
  return {
    id: p.id,
    artistId: p.artistId,
    artistName: p.artist.name,
    artistSlug: p.artist.slug,
    artistImageUrl: p.artist.imageUrl,
    authorMemberId: p.authorMember?.id ?? null,
    authorName: p.authorMember?.displayName ?? p.artist.name,
    authorImageUrl: p.authorMember?.imageUrl ?? p.artist.imageUrl,
    authorRoleLabel: p.authorMember?.roleLabel ?? null,
    category: CATEGORY_LABEL[p.category],
    categoryValue: p.category,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    visibility: p.visibility,
    locked: !eligible,
    content: eligible ? p.content : null,
    media: p.media.map((m) => ({
      id: m.id,
      type: m.type,
      url: eligible ? m.url : null,
      width: m.width,
      height: m.height,
      durationSec: m.durationSec,
      position: m.position,
    })),
    likeCount: p._count.likes,
    isLiked: likedPostIds.has(p.id),
    commentCount: p._count.comments,
  };
}

async function likedSetFor(viewerUserId: string | null, postIds: string[]): Promise<Set<string>> {
  if (!viewerUserId || postIds.length === 0) return new Set();
  const rows = await prisma.artistPostLike.findMany({
    where: { userId: viewerUserId, postId: { in: postIds } },
    select: { postId: true },
  });
  return new Set(rows.map((r) => r.postId));
}

/** One artist's feed, gated per viewer, cursor-paginated (newest first, stable under concurrent inserts). */
export async function getArtistFeedPage(
  artistId: string,
  viewerUserId: string | null,
  isOwner: boolean,
  cursor?: string | null,
  limit: number = FEED_PAGE_SIZE,
  memberId?: string | null
): Promise<FeedPage> {
  const rows = await prisma.artistPost.findMany({
    where: { artistId, ...(memberId ? { authorMemberId: memberId } : {}) },
    include: postInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  let purchased = false;
  let subscribed = false;
  if (viewerUserId && !isOwner) {
    [purchased, subscribed] = await Promise.all([
      hasPurchasedFromArtist(viewerUserId, artistId),
      isSubscribedToArtist(viewerUserId, artistId),
    ]);
  }

  const likedPostIds = await likedSetFor(viewerUserId, page.map((p) => p.id));

  const posts = page.map((p) => {
    const eligible =
      isOwner ||
      p.visibility === "PUBLIC" ||
      (p.visibility === "SUPPORTER" && purchased) ||
      (p.visibility === "SUBSCRIBER" && subscribed);
    return toView(p, eligible, likedPostIds);
  });

  return { posts, nextCursor: hasMore ? page[page.length - 1].id : null };
}

/**
 * Chronological feed of posts from every artist `viewerUserId` follows. Deliberately no
 * recommendation/ranking algorithm — followed artists only, newest first.
 */
export async function getFollowedArtistsFeedPage(
  viewerUserId: string,
  cursor?: string | null,
  limit: number = FEED_PAGE_SIZE
): Promise<FeedPage> {
  const follows = await prisma.follow.findMany({ where: { userId: viewerUserId }, select: { artistId: true } });
  const artistIds = follows.map((f) => f.artistId);
  if (artistIds.length === 0) return { posts: [], nextCursor: null };

  const rows = await prisma.artistPost.findMany({
    where: { artistId: { in: artistIds } },
    include: postInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  const pageArtistIds = Array.from(new Set(page.map((p) => p.artistId)));
  const [{ purchased, subscribed }, likedPostIds] = await Promise.all([
    getEligibilityForArtists(viewerUserId, pageArtistIds),
    likedSetFor(viewerUserId, page.map((p) => p.id)),
  ]);

  const posts = page.map((p) => {
    const eligible =
      p.visibility === "PUBLIC" ||
      (p.visibility === "SUPPORTER" && purchased.has(p.artistId)) ||
      (p.visibility === "SUBSCRIBER" && subscribed.has(p.artistId));
    return toView(p, eligible, likedPostIds);
  });

  return { posts, nextCursor: hasMore ? page[page.length - 1].id : null };
}
