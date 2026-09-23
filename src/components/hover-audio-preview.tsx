"use client";

import { useRef, useState } from "react";
import { CoverArt } from "@/components/cover-art";

/** So starting one card's preview pauses whichever other card was already playing — a plain module-level ref is enough since only one can play at a time across the whole page. */
let currentlyPlaying: HTMLAudioElement | null = null;

/**
 * Click-to-play preview overlay on a product card's cover art. Deliberately not hover-only —
 * hover has no equivalent on touch devices, so the play button and progress bar are always
 * visible and both mouse/tap-driven. Rendered inside a Link (see product-card.tsx), so every
 * handler here must stop the click from bubbling into a navigation.
 */
export function HoverAudioPreview({
  gradient,
  label,
  type,
  imageUrl,
  audioSrc,
  className = "",
  sizes,
  hasSecret = false,
  hideLabel = false,
}: {
  gradient: string;
  label: string;
  type?: string;
  imageUrl?: string;
  audioSrc?: string;
  className?: string;
  sizes?: string;
  hasSecret?: boolean;
  hideLabel?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleToggle = (e: React.MouseEvent) => {
    stop(e);
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
      }
      currentlyPlaying = audio;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    stop(e);
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const handleEnded = () => {
    setProgress(0);
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

      {audioSrc && (
        <>
          <audio
            ref={audioRef}
            src={audioSrc}
            preload="none"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={handleEnded}
          />

          <button
            type="button"
            onClick={handleToggle}
            aria-label={playing ? "미리듣기 일시정지" : "미리듣기 재생"}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/25"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-black shadow-lg">
              {playing ? "❚❚" : "▶"}
            </span>
          </button>

          <div
            onClick={handleSeek}
            className="absolute inset-x-1.5 bottom-1.5 z-10 h-1.5 cursor-pointer rounded-full bg-white/30"
          >
            <div
              className="h-full rounded-full bg-white transition-[width]"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
