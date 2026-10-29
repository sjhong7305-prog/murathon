"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { formatWon } from "@muraton/shared/format";
import { usePlayer } from "@/context/player-context";
import type { AttachedProduct } from "@/lib/community-storage";

export function MiniTrackCard({ product }: { product: AttachedProduct }) {
  const { current, playing, playOne, toggle } = usePlayer();
  const isCurrent = current?.productId === product.id;
  const isPlaying = isCurrent && playing;

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      toggle();
      return;
    }
    playOne({
      productId: product.id,
      title: product.title,
      artistName: product.artistName,
      // Filled in from the stream grant; the attachment snapshot doesn't carry the slug.
      artistSlug: "",
      coverColor: product.coverColor,
      imageUrl: product.imageUrl,
    });
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
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? `${product.title} 일시정지` : `${product.title} 미리듣기 재생`}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:bg-accent-strong"
        >
          {isPlaying ? (
            <Pause aria-hidden className="size-4 fill-current" />
          ) : (
            <Play aria-hidden className="size-4 translate-x-px fill-current" />
          )}
        </button>
      )}
    </Link>
  );
}
