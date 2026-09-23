"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CoverArt } from "@/components/cover-art";
import { formatWon } from "@/lib/format";
import type { AttachedProduct } from "@/lib/community-storage";

export function MiniTrackCard({ product }: { product: AttachedProduct }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-cream p-2.5 transition hover:border-accent/40"
    >
      <div className="w-12 shrink-0">
        <CoverArt
          gradient={product.coverColor}
          label={product.title}
          imageUrl={product.imageUrl}
          hideLabel
          rounded="rounded-lg"
          sizes="48px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{product.title}</p>
        <p className="truncate text-xs text-muted">
          {product.artistName} · {formatWon(product.suggestedPrice)}
        </p>
      </div>

      {product.previewAudioUrl && (
        <>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "일시정지" : "미리듣기 재생"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-strong"
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <audio
            ref={audioRef}
            src={product.previewAudioUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
        </>
      )}
    </Link>
  );
}
