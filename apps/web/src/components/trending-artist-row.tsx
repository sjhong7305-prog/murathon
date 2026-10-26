"use client";

import Link from "next/link";
import Image from "next/image";
import { Artist, Product } from "@muraton/shared/types";
import { usePlayer } from "@/context/player-context";

export function TrendingArtistRow({
  index,
  artist,
  track,
}: {
  index: number;
  artist: Artist;
  /** Artist's newest published release. Omitted entirely when the artist has none. */
  track?: Product;
}) {
  const { current, playing, playOne, toggle } = usePlayer();
  const isCurrent = Boolean(track) && current?.productId === track?.id;
  const isPlaying = isCurrent && playing;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!track) return;
    if (isCurrent) {
      toggle();
    } else {
      playOne({
        productId: track.id,
        title: track.title,
        artistName: artist.name,
        artistSlug: artist.slug,
        coverColor: track.coverColor,
        imageUrl: track.imageUrl,
      });
    }
  };

  const playButton = track && (
    <button
      type="button"
      onClick={handlePlayClick}
      aria-label={isPlaying ? "일시정지" : "재생"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs text-white transition hover:bg-accent-strong sm:h-9 sm:w-9 sm:text-sm"
    >
      {isPlaying ? "❚❚" : "▶"}
    </button>
  );

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="group relative flex items-center gap-3 border-b border-line py-4 transition-colors hover:bg-surface last:border-b-0 sm:gap-4"
    >
      {isCurrent && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent-strong" />
      )}

      <span className="hidden w-6 shrink-0 font-mono text-xs tabular-nums text-muted sm:block">
        {String(index).padStart(2, "0")}
      </span>

      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[4px] bg-line sm:h-[72px] sm:w-[72px]">
        {artist.imageUrl ? (
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            sizes="(max-width: 640px) 56px, 72px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-ink/50 sm:text-xl">
            {artist.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <h3 className="truncate text-[18px] font-semibold text-ink group-hover:underline">
              {artist.name}
            </h3>
            {artist.genre && <span className="truncate text-sm text-muted">{artist.genre}</span>}
          </div>

          {track && (
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <span className="max-w-[160px] truncate text-sm text-muted">{track.title}</span>
              {playButton}
            </div>
          )}
        </div>

        {artist.tagline && <p className="mt-0.5 truncate text-sm text-muted">{artist.tagline}</p>}

        {track && <div className="mt-1.5 flex justify-end sm:hidden">{playButton}</div>}
      </div>
    </Link>
  );
}
