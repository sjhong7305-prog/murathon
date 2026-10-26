"use client";

import Link from "next/link";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { Artist, Product } from "@muraton/shared/types";
import { usePlayer } from "@/context/player-context";

/** Spotify-style shelf card: round portrait, name, genre, and a hover play button for the latest release. */
export function NewArtistCard({ artist, track }: { artist: Artist; track?: Product }) {
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

  const meta = [artist.genre, artist.location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="group block rounded-xl p-3 transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <div className="relative">
        <div className="relative aspect-square overflow-hidden rounded-full bg-line shadow-[0_8px_24px_rgba(20,20,18,0.12)]">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 34vw, 160px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-ink/40">
              {artist.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {track && (
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={isPlaying ? `${track.title} 일시정지` : `${artist.name} 최신곡 재생`}
            className={`absolute right-1 bottom-1 grid size-9 place-items-center rounded-full bg-accent text-ink shadow-[0_6px_16px_rgba(20,20,18,0.25)] transition duration-200 hover:scale-105 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              isCurrent
                ? "translate-y-0 opacity-100"
                : "translate-y-0 opacity-100 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            }`}
          >
            {isPlaying ? (
              <Pause aria-hidden className="size-4 fill-current" />
            ) : (
              <Play aria-hidden className="ml-0.5 size-4 fill-current" />
            )}
          </button>
        )}
      </div>

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-[15px] font-bold text-ink">{artist.name}</h3>
        <p className="mt-0.5 truncate text-[13px] text-muted">{meta || "Artist"}</p>
      </div>
    </Link>
  );
}
