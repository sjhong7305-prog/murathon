import { prisma } from "@muraton/db";
import { PREVIEW_LIMIT_SECONDS } from "@/lib/playlist-constants";

export interface StreamGrant {
  url: string | null;
  mode: "full" | "preview";
  previewLimitSeconds: number;
  /** Lets the player label an item that was started without artist info (e.g. a bare product card). */
  artistName: string;
  artistSlug: string;
}

/**
 * Decides full-vs-preview playback for a product server-side, and only then hands back the audio
 * URL — callers must never embed a product's previewAudioUrl directly for a track that might not
 * be owned by the current viewer (public playlists, anyone browsing someone else's playlist).
 */
export async function getStreamGrant(productId: string, userId: string | null): Promise<StreamGrant | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { previewAudioUrl: true, artist: { select: { name: true, slug: true } } },
  });
  if (!product) return null;

  const owned = userId
    ? (await prisma.orderItem.count({ where: { productId, order: { buyerUserId: userId } } })) > 0
    : false;

  return {
    url: product.previewAudioUrl,
    mode: owned ? "full" : "preview",
    previewLimitSeconds: PREVIEW_LIMIT_SECONDS,
    artistName: product.artist.name,
    artistSlug: product.artist.slug,
  };
}

/**
 * Same full-vs-preview decision, but for one track inside an album — ownership is decided by
 * whether the viewer purchased the *parent* product, not the track row itself (tracks aren't
 * sold individually). Falls back to the parent product's own preview audio if the track has none.
 */
export async function getAlbumTrackStreamGrant(
  trackId: string,
  userId: string | null
): Promise<StreamGrant | null> {
  const track = await prisma.albumTrack.findUnique({
    where: { id: trackId },
    select: {
      previewUrl: true,
      product: { select: { id: true, previewAudioUrl: true, artist: { select: { name: true, slug: true } } } },
    },
  });
  if (!track) return null;

  const owned = userId
    ? (await prisma.orderItem.count({
        where: { productId: track.product.id, order: { buyerUserId: userId } },
      })) > 0
    : false;

  return {
    url: track.previewUrl ?? track.product.previewAudioUrl,
    mode: owned ? "full" : "preview",
    previewLimitSeconds: PREVIEW_LIMIT_SECONDS,
    artistName: track.product.artist.name,
    artistSlug: track.product.artist.slug,
  };
}

/**
 * A standalone uploaded track (the `tracks` table, /tracks/[id]) is never sold, so it only ever
 * plays as a preview cut at the artist's own limit.
 */
export async function getUploadedTrackStreamGrant(trackId: string): Promise<StreamGrant | null> {
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    select: { previewAudioUrl: true, previewLimitSeconds: true, artist: { select: { name: true, slug: true } } },
  });
  if (!track) return null;
  return {
    url: track.previewAudioUrl,
    mode: "preview",
    previewLimitSeconds: track.previewLimitSeconds,
    artistName: track.artist.name,
    artistSlug: track.artist.slug,
  };
}
