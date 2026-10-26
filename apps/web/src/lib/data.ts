import { prisma } from "@muraton/db";
import type { Artist, Product, ReleaseFormat, AlbumTrack, ArtistMemberSummary } from "@muraton/shared/types";
import { parseArtistTheme } from "@muraton/shared/artist-theme";

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
