"use client";

import { Pause, Play } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { usePlayer, usePlayerProgress } from "@/context/player-context";

/**
 * Click-to-play preview overlay on a product card's cover art. Playback goes through the global
 * bottom player (server-decided preview limit, keeps playing across pages). Deliberately not
 * hover-only — hover has no equivalent on touch devices, so the play button is always visible.
 * Rendered inside a Link (see product-card.tsx), so every handler here must stop the click from
 * bubbling into a navigation.
 */
export function HoverAudioPreview({
  productId,
  gradient,
  label,
  type,
  imageUrl,
  className = "",
  sizes,
  hasSecret = false,
  hideLabel = false,
}: {
  productId: string;
  gradient: string;
  label: string;
  type?: string;
  imageUrl?: string;
  className?: string;
  sizes?: string;
  hasSecret?: boolean;
  hideLabel?: boolean;
}) {
  const { current, playing, playOne, toggle } = usePlayer();
  const isCurrent = current?.productId === productId;
  const isPlaying = isCurrent && playing;

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleToggle = (e: React.MouseEvent) => {
    stop(e);
    if (isCurrent) {
      toggle();
      return;
    }
    // Artist name/slug are filled in by the stream grant once playback starts.
    playOne({ productId, title: label, artistName: "", artistSlug: "", coverColor: gradient, imageUrl });
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <CoverArt
        gradient={gradient}
        label={label}
        type={type}
        imageUrl={imageUrl}
        sizes={sizes}
        hasSecret={hasSecret}
        hideLabel={hideLabel}
      />

      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? `${label} 미리듣기 일시정지` : `${label} 미리듣기 재생`}
        className="group/play absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/25"
      >
        <span className="grid size-11 place-items-center rounded-full bg-lime text-ink shadow-[0_6px_16px_rgba(20,20,18,0.25)] transition group-hover/play:scale-105">
          {isPlaying ? (
            <Pause aria-hidden className="size-4 fill-current" />
          ) : (
            <Play aria-hidden className="size-4 translate-x-px fill-current" />
          )}
        </span>
      </button>

      {isCurrent && <CardProgress onSeekClick={stop} />}
    </div>
  );
}

/** Thin seekable progress line along the cover's bottom while this card is the one playing. */
function CardProgress({ onSeekClick }: { onSeekClick: (e: React.SyntheticEvent) => void }) {
  const { seek } = usePlayer();
  const { currentTime, duration } = usePlayerProgress();
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      onClick={(e) => {
        onSeekClick(e);
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        seek(((e.clientX - rect.left) / rect.width) * duration);
      }}
      aria-hidden
      className="absolute inset-x-1.5 bottom-1.5 z-10 h-1.5 cursor-pointer rounded-full bg-white/30"
    >
      <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
    </div>
  );
}
