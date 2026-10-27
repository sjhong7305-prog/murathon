import { prisma } from "@muraton/db";
import type { Artist, Product, ReleaseFormat, AlbumTrack, ArtistMemberSummary } from "@muraton/shared/types";
import { parseArtistTheme } from "@muraton/shared/artist-theme";
import type { FanVoice, HomeTrack, LiveSupport } from "@/lib/home-types";

type DbArtist = Awaited<ReturnType<typeof fetchArtistRow>>;
type DbProduct = Awaited<ReturnType<typeof fetchProductRow>>;

const PRODUCT_INCLUDE = { releaseFormats: true } as const;

async function fetchArtistRow(where: { id: string } | { slug: string }) {
  return prisma.artist.findUnique({
    where,
    include: { supporters: { orderBy: { createdAt: "asc" } } },
  });
}

async function fetchProductRow(id: string) {
  return prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
}

function toReleaseFormats(rows: NonNullable<DbProduct>["releaseFormats"]): ReleaseFormat[] {
  return rows.map((f) => ({
    id: f.id,
    format: f.format.toLowerCase() as ReleaseFormat["format"],
    price: f.price,
    stock: f.stock ?? undefined,
    includesDigital: f.includesDigital,
    shippingRequired: f.shippingRequired,
  }));
}

async function fetchAlbumTracks(productId: string): Promise<AlbumTrack[]> {
  const rows = await prisma.albumTrack.findMany({
    where: { productId },
    orderBy: { trackNumber: "asc" },
  });
  return rows.map((t) => ({
    id: t.id,
    trackNumber: t.trackNumber,
    title: t.title,
    durationSec: t.durationSec,
    isTitle: t.isTitle,
  }));
}

function toArtist(row: NonNullable<DbArtist>): Artist {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    genre: row.genre,
    genreTags: row.genreTags,
    location: row.location,
    tagline: row.tagline,
    introduction: row.introduction,
    coverColor: row.coverColor,
    imageUrl: row.imageUrl ?? undefined,
    bannerImage: row.bannerImage ?? undefined,
    externalLinks: {
      sns: row.snsLink ?? undefined,
      youtube: row.youtubeLink ?? undefined,
      website: row.websiteLink ?? undefined,
    },
    checkoutQuestion: row.checkoutQuestion ?? undefined,
    subscriptionPriceMonthly: row.subscriptionPriceMonthly ?? undefined,
    subscriptionPriceYearly: row.subscriptionPriceYearly ?? undefined,
    subscriptionBenefits: row.subscriptionBenefits,
    membershipEnabled: row.membershipEnabled,
    supporters: row.supporters.map((s) => s.nickname),
    payoutStatus: row.payoutStatus,
    theme: parseArtistTheme(row.theme),
  };
}

function toProduct(row: NonNullable<DbProduct>, tracks?: AlbumTrack[]): Product {
  return {
    id: row.id,
    artistId: row.artistId,
    type: row.type.toLowerCase() as Product["type"],
    status: row.status.toLowerCase() as Product["status"],
    title: row.title,
    description: row.description,
    format: row.format ?? undefined,
    releaseType: row.releaseType?.toLowerCase() as Product["releaseType"],
    formats: toReleaseFormats(row.releaseFormats),
    genre: row.genre ?? undefined,
    minPrice: row.minPrice,
    suggestedPrice: row.suggestedPrice,
    coverColor: row.coverColor,
    imageUrl: row.imageUrl ?? undefined,
    previewAudioUrl: row.previewAudioUrl ?? undefined,
    secretContent:
      row.secretTitle && row.secretMessage
        ? { title: row.secretTitle, message: row.secretMessage }
        : undefined,
    eventName: row.eventName ?? undefined,
    venue: row.venue ?? undefined,
    eventAt: row.eventAt?.toISOString() ?? undefined,
    includedAlbumId: row.includedAlbumId ?? undefined,
    longDescription: row.longDescription ?? undefined,
    releaseDate: row.releaseDate?.toISOString() ?? undefined,
    credits: row.credits ?? undefined,
    durationSec: row.durationSec ?? undefined,
    tracks,
  };
}

export async function getAllArtists(): Promise<Artist[]> {
  const rows = await prisma.artist.findMany({
    include: { supporters: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toArtist);
}

/** Store-facing catalog: unpublished (soft-deleted) releases never surface here or in search. */
export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => toProduct(r));
}

/**
 * Up to `limit` published album/track releases across all artists, for the home page's
 * "지금 인기 있는 발매작" section. No popularity signal (plays/supporters/revenue) exists yet,
 * so this sorts newest release date first (falling back to createdAt) rather than going quiet.
 */
export async function getFeaturedReleases(limit: number): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { type: { in: ["ALBUM", "TRACK"] }, status: "PUBLISHED" },
    include: PRODUCT_INCLUDE,
    orderBy: [{ releaseDate: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map((r) => toProduct(r));
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Last calendar week in Korea time: [Monday 00:00 KST of last week, Monday 00:00 KST of this week). */
export function lastWeekRangeKst(now: Date = new Date()): { start: Date; end: Date } {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const daysSinceMonday = (kst.getUTCDay() + 6) % 7;
  const thisMondayKst = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - daysSinceMonday);
  const end = new Date(thisMondayKst - KST_OFFSET_MS);
  return { start: new Date(end.getTime() - WEEK_MS), end };
}

/**
 * Albums ranked by how many orders included them last week (see lastWeekRangeKst).
 * Ties break on units sold, then the newer release. Albums with no orders that week are left out,
 * so this is empty in a week without album sales.
 */
export async function getLastWeekPopularAlbums(limit: number): Promise<Product[]> {
  const { start, end } = lastWeekRangeKst();
  const ranked = await prisma.$queryRaw<{ productId: string }[]>`
    SELECT oi."productId"
    FROM order_items oi
    JOIN orders o ON o.id = oi."orderId"
    JOIN products p ON p.id = oi."productId"
    WHERE o."createdAt" >= ${start} AND o."createdAt" < ${end}
      AND p.type = 'ALBUM' AND p.status = 'PUBLISHED'
    GROUP BY oi."productId", p."releaseDate"
    ORDER BY COUNT(DISTINCT oi."orderId") DESC, SUM(oi.quantity) DESC, p."releaseDate" DESC NULLS LAST
    LIMIT ${limit}
  `;
  if (ranked.length === 0) return [];

  const ids = ranked.map((r) => r.productId);
  const rows = await prisma.product.findMany({ where: { id: { in: ids } }, include: PRODUCT_INCLUDE });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [toProduct(row)] : [];
  });
}

export async function getArtistBySlug(slug: string): Promise<Artist | undefined> {
  const row = await fetchArtistRow({ slug });
  return row ? toArtist(row) : undefined;
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const row = await fetchArtistRow({ id });
  return row ? toArtist(row) : undefined;
}

/**
 * `includeUnpublished` defaults to false so the public Artist Profile (and anything derived from
 * it) never surfaces a soft-deleted release. Owner-only surfaces (dashboard release management,
 * appearance settings) pass `true` since the artist still needs to see their own unpublished items.
 */
export async function getProductsByArtist(
  artistId: string,
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {}
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { artistId, ...(includeUnpublished ? {} : { status: "PUBLISHED" }) },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => toProduct(r));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await fetchProductRow(id);
  if (!row) return undefined;
  const tracks =
    row.type === "ALBUM" || row.type === "TRACK" ? await fetchAlbumTracks(id) : undefined;
  return toProduct(row, tracks);
}

/** Up to `limit` most recent album/track releases, newest release date (falling back to createdAt) first. */
export async function getLatestReleasesByArtist(artistId: string, limit: number): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { artistId, type: { in: ["ALBUM", "TRACK"] }, status: "PUBLISHED" },
    include: PRODUCT_INCLUDE,
    orderBy: [{ releaseDate: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map((r) => toProduct(r));
}

/** Up to `limit` future ticket products, soonest event first. */
export async function getUpcomingShowsByArtist(artistId: string, limit: number): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { artistId, type: "TICKET", eventAt: { gte: new Date() } },
    include: PRODUCT_INCLUDE,
    orderBy: { eventAt: "asc" },
    take: limit,
  });
  return rows.map((r) => toProduct(r));
}

/**
 * Band member roster for the artist sidebar. displayName/imageUrl fall back to the artist's own
 * user nickname / profile image when the member hasn't set a per-member public identity — same
 * fallback convention as ArtistPost's authorMember (see schema.prisma comment on ArtistMember).
 */
export async function getArtistMembers(artistId: string): Promise<ArtistMemberSummary[]> {
  const rows = await prisma.artistMember.findMany({
    where: { artistId },
    include: {
      user: { select: { nickname: true } },
      artist: { select: { imageUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((m) => ({
    id: m.id,
    name: m.displayName ?? m.user.nickname,
    imageUrl: m.imageUrl ?? m.artist.imageUrl ?? undefined,
    roleLabel: m.roleLabel ?? undefined,
  }));
}
const DAY_MS = 24 * 60 * 60 * 1000;

const HOME_TRACK_SELECT = {
  id: true,
  title: true,
  coverColor: true,
  imageUrl: true,
  previewAudioUrl: true,
  artist: { select: { id: true, name: true, slug: true } },
} as const;

type HomeTrackRow = {
  id: string;
  title: string;
  coverColor: string;
  imageUrl: string | null;
  previewAudioUrl: string | null;
  artist: { id: string; name: string; slug: string };
};

function toHomeTrack(product: HomeTrackRow): HomeTrack {
  return {
    productId: product.id,
    title: product.title,
    artistId: product.artist.id,
    artistName: product.artist.name,
    artistSlug: product.artist.slug,
    coverColor: product.coverColor,
    imageUrl: product.imageUrl ?? undefined,
    playable: Boolean(product.previewAudioUrl),
  };
}

/**
 * Newest order items from the last 30 days for the home "LIVE" ticker. Only published products,
 * and the buyer's nickname only when they opted in as a public supporter — no email, user id, or
 * cheer message ever leaves this function.
 */
export async function getRecentSupports(limit = 20): Promise<LiveSupport[]> {
  const items = await prisma.orderItem.findMany({
    where: {
      order: { createdAt: { gte: new Date(Date.now() - 30 * DAY_MS) } },
      product: { status: "PUBLISHED" },
    },
    select: {
      id: true,
      price: true,
      quantity: true,
      order: { select: { createdAt: true, listAsSupporter: true, name: true } },
      product: { select: HOME_TRACK_SELECT },
    },
    orderBy: { order: { createdAt: "desc" } },
    take: limit,
  });
  return items.map((item) => ({
    ...toHomeTrack(item.product),
    id: item.id,
    amount: item.price * item.quantity,
    supporter: item.order.listAsSupporter && item.order.name.trim() ? item.order.name.trim() : null,
    createdAt: item.order.createdAt.toISOString(),
  }));
}

/**
 * Candidate pool for the home "Dig in 30s" mix: published albums/tracks that actually have preview
 * audio, newest first. The client picks one release per artist from this pool, so it can reshuffle
 * without a round trip even when the page itself is cached.
 */
export async function getDigCandidates(limit = 24): Promise<HomeTrack[]> {
  const rows = await prisma.product.findMany({
    where: { type: { in: ["ALBUM", "TRACK"] }, status: "PUBLISHED", previewAudioUrl: { not: null } },
    select: HOME_TRACK_SELECT,
    orderBy: [{ releaseDate: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(toHomeTrack);
}

const FAN_VOICE_MIN_LENGTH = 10;
const FAN_VOICE_MAX_PER_ARTIST = 2;

/**
 * Public fan messages for the home "Fan Voices" wall: cheer messages from orders whose buyer opted
 * in as a supporter, plus supporter notes. Newest first, at most two per artist so one popular
 * release can't take over the wall.
 */
export async function getRecentFanVoices(limit = 9): Promise<FanVoice[]> {
  const [orders, notes] = await Promise.all([
    prisma.order.findMany({
      where: { listAsSupporter: true, cheerMessage: { not: null } },
      select: {
        id: true,
        name: true,
        cheerMessage: true,
        createdAt: true,
        items: {
          where: { product: { status: "PUBLISHED" } },
          select: { price: true, quantity: true, product: { select: HOME_TRACK_SELECT } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit * 3,
    }),
    prisma.supporterNote.findMany({
      where: { product: { status: "PUBLISHED" } },
      select: {
        id: true,
        message: true,
        createdAt: true,
        user: { select: { nickname: true } },
        product: { select: HOME_TRACK_SELECT },
      },
      orderBy: { createdAt: "desc" },
      take: limit * 3,
    }),
  ]);

  const voices: FanVoice[] = [
    ...orders.flatMap((order) => {
      const item = order.items[0];
      if (!item || !order.cheerMessage) return [];
      return [
        {
          ...toHomeTrack(item.product),
          id: `order-${order.id}`,
          message: order.cheerMessage.trim(),
          supporter: order.name,
          amount: item.price * item.quantity,
          createdAt: order.createdAt.toISOString(),
        },
      ];
    }),
    ...notes.map((note) => ({
      ...toHomeTrack(note.product),
      id: `note-${note.id}`,
      message: note.message.trim(),
      supporter: note.user.nickname,
      createdAt: note.createdAt.toISOString(),
    })),
  ];

  const perArtist = new Map<string, number>();
  return voices
    .filter((voice) => voice.message.length >= FAN_VOICE_MIN_LENGTH)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((voice) => {
      const count = perArtist.get(voice.artistId) ?? 0;
      if (count >= FAN_VOICE_MAX_PER_ARTIST) return false;
      perArtist.set(voice.artistId, count + 1);
      return true;
    })
    .slice(0, limit);
}

/** Newest playable release for each of `artistIds` (used by the hero's "대표곡 듣기" button). */
export async function getLatestTrackByArtists(artistIds: string[]): Promise<Map<string, HomeTrack>> {
  if (artistIds.length === 0) return new Map();
  const rows = await prisma.product.findMany({
    where: { artistId: { in: artistIds }, type: { in: ["ALBUM", "TRACK"] }, status: "PUBLISHED" },
    select: HOME_TRACK_SELECT,
    orderBy: [{ releaseDate: "desc" }, { createdAt: "desc" }],
  });
  const byArtist = new Map<string, HomeTrack>();
  for (const row of rows) {
    if (!byArtist.has(row.artist.id)) byArtist.set(row.artist.id, toHomeTrack(row));
  }
  return byArtist;
}
