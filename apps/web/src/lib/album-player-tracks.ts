import type { Artist, Product } from "@muraton/shared/types";
import type { PlayerTrack } from "@/context/player-context";

/**
 * A release as a player queue: one entry per album track (each with its own stream endpoint), or
 * the single track itself. Album tracks share the album's productId, so likes and purchase links
 * from the player point at the album.
 */
export function albumPlayerTracks(product: Product, artist: Pick<Artist, "name" | "slug">): PlayerTrack[] {
  const base = {
    productId: product.id,
    artistName: artist.name,
    artistSlug: artist.slug,
    coverColor: product.coverColor,
    imageUrl: product.imageUrl,
  };
  if (product.type === "track") {
    return [{ ...base, title: product.title, durationSec: product.durationSec }];
  }
  if (product.type !== "album") return [];
  return [...(product.tracks ?? [])]
    .sort((a, b) => a.trackNumber - b.trackNumber)
    .map((t) => ({
      ...base,
      key: `album-track-${t.id}`,
      title: t.title,
      durationSec: t.durationSec,
      streamPath: `/api/album-tracks/${t.id}/stream`,
    }));
}
