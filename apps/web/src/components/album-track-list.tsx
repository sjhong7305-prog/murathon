"use client";

import { Lock, Pause, Play } from "lucide-react";
import type { Artist, Product } from "@muraton/shared/types";
import { formatDuration } from "@muraton/shared/format";
import { trackKey, usePlayer } from "@/context/player-context";
import { albumPlayerTracks } from "@/lib/album-player-tracks";

/** Tracklist that plays through the global bottom player; clicking a row queues the whole release from that track. */
export function AlbumTrackList({ product, artist }: { product: Product; artist: Artist }) {
  const { current, playing, grant, previewEnded, playQueue, toggle } = usePlayer();
  const tracks = albumPlayerTracks(product, artist);
  if (tracks.length === 0) return null;

  const titleTrackIds = new Set((product.tracks ?? []).filter((t) => t.isTitle).map((t) => `album-track-${t.id}`));
  const totalSeconds = tracks.reduce((sum, t) => sum + (t.durationSec ?? 0), 0);
  const currentKey = current ? trackKey(current) : null;

  return (
    <section aria-labelledby="tracklist-title" className="mt-14">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id="tracklist-title" className="text-2xl font-bold tracking-tight text-ink">
          수록곡
        </h2>
        <p className="text-sm text-muted tabular-nums">
          {tracks.length}곡{totalSeconds > 0 ? ` · ${formatDuration(totalSeconds)}` : ""}
        </p>
      </div>

      <ol className="overflow-hidden rounded-2xl border border-line bg-surface">
        {tracks.map((track, i) => {
          const isCurrent = currentKey === trackKey(track);
          const isPlaying = isCurrent && playing;
          return (
            <li key={trackKey(track)} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => (isCurrent ? toggle() : playQueue(tracks, i))}
                aria-label={isPlaying ? `${track.title} 일시정지` : `${track.title} 재생`}
                aria-current={isCurrent || undefined}
                className={`group flex min-h-14 w-full items-center gap-4 px-4 py-2 text-left transition-colors hover:bg-cream sm:px-5 ${
                  isCurrent ? "bg-lime/20 hover:bg-lime/30" : ""
                }`}
              >
                <span className="relative grid size-8 shrink-0 place-items-center">
                  <span
                    className={`text-sm font-semibold text-muted tabular-nums transition-opacity ${
                      isCurrent ? "opacity-0" : "group-hover:opacity-0"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    aria-hidden
                    className={`absolute inset-0 grid place-items-center rounded-full bg-ink text-cream transition-opacity ${
                      isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="size-3.5 fill-current" />
                    ) : (
                      <Play className="size-3.5 translate-x-px fill-current" />
                    )}
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate text-[15px] font-semibold ${isCurrent ? "text-ink" : "text-ink/90"}`}>
                      {track.title}
                    </span>
                    {titleTrackIds.has(trackKey(track)) && (
                      <span className="shrink-0 rounded-full bg-lime px-2 py-0.5 text-[10px] font-black tracking-wider text-ink">
                        TITLE
                      </span>
                    )}
                  </span>
                  {isCurrent && grant?.mode === "preview" && (
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Lock aria-hidden className="size-3" />
                      {previewEnded ? "미리듣기 종료 · 구매 후 전체 듣기" : `미리듣기 ${grant.previewLimitSeconds}초`}
                    </span>
                  )}
                </span>

                <span className="shrink-0 text-sm text-muted tabular-nums">{formatDuration(track.durationSec)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
