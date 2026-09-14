"use client";

import { useRef, useState } from "react";
import { CoverArt } from "@/components/cover-art";

export function HoverAudioPreview({
  gradient,
  label,
  type,
  imageUrl,
  audioSrc,
  className = "",
  sizes,
  hasSecret = false,
}: {
  gradient: string;
  label: string;
  type?: string;
  imageUrl?: string;
  audioSrc?: string;
  className?: string;
  sizes?: string;
  hasSecret?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CoverArt
        gradient={gradient}
        label={label}
        type={type}
        imageUrl={imageUrl}
        sizes={sizes}
        hasSecret={hasSecret}
      />

      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="none" />}

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40 transition-opacity duration-200 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 pl-1 text-xl text-black shadow-lg">
          ▶
        </span>
      </div>
    </div>
  );
}
