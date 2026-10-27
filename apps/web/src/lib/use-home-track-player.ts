"use client";

import { usePlayer, type PlayerTrack } from "@/context/player-context";
import type { HomeTrack } from "./home-types";

export function toPlayerTrack(track: HomeTrack): PlayerTrack {
  return {
    productId: track.productId,
    title: track.title,
    artistName: track.artistName,
    artistSlug: track.artistSlug,
    coverColor: track.coverColor,
    imageUrl: track.imageUrl,
  };
}

/** Play/pause state + click handler for a single home-section track (safe inside a Link). */
export function useHomeTrackPlayer(track: HomeTrack | undefined) {
  const { current, playing, playOne, toggle } = usePlayer();
  const isCurrent = Boolean(track) && current?.productId === track?.productId;
  const isPlaying = isCurrent && playing;

  const onPlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!track) return;
    if (isCurrent) toggle();
    else playOne(toPlayerTrack(track));
  };

  return { isCurrent, isPlaying, onPlayClick };
}
