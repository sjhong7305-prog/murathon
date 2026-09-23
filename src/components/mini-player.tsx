"use client";

import Link from "next/link";
import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";

export function MiniPlayer() {
  const { current, playing, grant, previewEnded, toggle, next, prev, close, currentIndex, queue } =
    usePlayer();

  if (!current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="w-11 shrink-0">
          <CoverArt
            gradient={current.coverColor}
            label={current.title}
            imageUrl={current.imageUrl ?? undefined}
            hideLabel
            rounded="rounded-lg"
            sizes="44px"
          />
        </div>
        <div className="min-w-0 shrink-0 sm:w-40">
          <p className="truncate text-sm font-bold text-ink">{current.title}</p>
          <Link
            href={`/artists/${current.artistSlug}`}
            className="truncate text-xs text-muted hover:text-accent-strong"
          >
            {current.artistName}
          </Link>
        </div>

        {grant?.url ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {queue.length > 1 && (
              <button
                type="button"
                onClick={prev}
                disabled={currentIndex === 0}
                className="shrink-0 rounded-full border border-line px-2.5 py-1.5 text-xs font-bold text-ink disabled:opacity-30"
              >
                ⏮
              </button>
            )}
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white"
            >
              {playing ? "❚❚" : "▶"}
            </button>
            {queue.length > 1 && (
              <button
                type="button"
                onClick={next}
                disabled={currentIndex >= queue.length - 1}
                className="shrink-0 rounded-full border border-line px-2.5 py-1.5 text-xs font-bold text-ink disabled:opacity-30"
              >
                ⏭
              </button>
            )}
            {grant.mode === "preview" && (
              <span className="truncate text-xs text-muted">
                {previewEnded
                  ? "🔒 미리듣기 종료"
                  : `미리듣기 ${grant.previewLimitSeconds}초`}
              </span>
            )}
          </div>
        ) : (
          <p className="flex-1 text-xs text-muted">재생 정보를 불러오는 중...</p>
        )}

        {grant?.mode === "preview" && (
          <Link
            href={`/products/${current.productId}`}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent-strong"
          >
            후원하고 전곡 듣기
          </Link>
        )}

        <button
          type="button"
          onClick={close}
          className="shrink-0 rounded-full border border-line px-2.5 py-1.5 text-xs font-bold text-muted hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
