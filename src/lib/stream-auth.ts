import { prisma } from "@/lib/prisma";
import { PREVIEW_LIMIT_SECONDS } from "@/lib/playlist-constants";

export interface StreamGrant {
  url: string | null;
  mode: "full" | "preview";
  previewLimitSeconds: number;
}

/**
 * Decides full-vs-preview playback for a product server-side, and only then hands back the audio
 * URL — callers must never embed a product's previewAudioUrl directly for a track that might not
 * be owned by the current viewer (public playlists, anyone browsing someone else's playlist).
 */
export async function getStreamGrant(productId: string, userId: string | null): Promise<StreamGrant | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { previewAudioUrl: true },
  });
  if (!product) return null;

  const owned = userId
    ? (await prisma.orderItem.count({ where: { productId, order: { buyerUserId: userId } } })) > 0
    : false;

  return {
    url: product.previewAudioUrl,
    mode: owned ? "full" : "preview",
    previewLimitSeconds: PREVIEW_LIMIT_SECONDS,
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
    select: { previewUrl: true, product: { select: { id: true, previewAudioUrl: true } } },
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
  };
}
