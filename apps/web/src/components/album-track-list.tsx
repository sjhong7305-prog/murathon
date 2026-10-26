"use client";

import { useRef, useState } from "react";
import type { AlbumTrack } from "@muraton/shared/types";
import { formatDuration } from "@muraton/shared/format";

interface StreamGrant {
  url: string | null;
  mode: "full" | "preview";
  previewLimitSeconds: number;
}

interface Row {
  id: string;
  trackNumber: number;
  title: string;
  durationSec?: number;
  isTitle: boolean;
  streamPath: string;
}

export function AlbumTrackList({
  productId,
  productType,
  productTitle,
  productDurationSec,
  tracks,
}: {
  productId: string;
  productType: "album" | "track";
  productTitle: string;
  productDurationSec?: number;
  tracks?: AlbumTrack[];
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [grant, setGrant] = useState<StreamGrant | null>(null);
  const [previewEnded, setPreviewEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const rows: Row[] =
    productType === "track"
      ? [
          {
            id: productId,
            trackNumber: 1,
            title: productTitle,
            durationSec: productDurationSec,
            isTitle: false,
            streamPath: `/api/products/${productId}/stream`,
          },
        ]
      : (tracks ?? []).map((t) => ({
          id: t.id,
          trackNumber: t.trackNumber,
          title: t.title,
          durationSec: t.durationSec,
          isTitle: t.isTitle,
          streamPath: `/api/album-tracks/${t.id}/stream`,
        }));

  if (rows.length === 0) return null;

  const totalSeconds = rows.reduce((sum, r) => sum + (r.durationSec ?? 0), 0);

  const handleRowClick = async (row: Row) => {
    if (playingId === row.id) {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
      return;
    }

    setPlayingId(row.id);
    setPreviewEnded(false);
    setGrant(null);
    setPlaying(true);
    const res = await fetch(row.streamPath);
    setGrant(res.ok ? await res.json() : null);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !grant) return;
    if (grant.mode === "preview" && audio.currentTime >= grant.previewLimitSeconds) {
      audio.pause();
      audio.currentTime = 0;
      setPreviewEnded(true);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold text-ink">
        수록곡 {rows.length}곡{totalSeconds > 0 ? ` · 총 ${formatDuration(totalSeconds)}` : ""}
      </h2>
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {rows.map((row) => {
          const isCurrent = playingId === row.id;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => handleRowClick(row)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-cream ${
                isCurrent ? "bg-accent/10" : ""
              }`}
            >
              <span className="w-5 shrink-0 text-center text-xs text-muted">{row.trackNumber}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm text-white">
                {isCurrent && playing ? "❚❚" : "▶"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`truncate text-sm font-semibold ${
                      isCurrent ? "text-accent-strong" : "text-ink"
                    }`}
                  >
                    {row.title}
                  </span>
                  {row.isTitle && (
                    <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                      TITLE
                    </span>
                  )}
                </span>
                {isCurrent && grant?.mode === "preview" && (
                  <span className="block text-[11px] text-muted">
                    {previewEnded ? "🔒 미리듣기 종료 · 구매 후 전체 듣기" : `미리듣기 ${grant.previewLimitSeconds}초`}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-muted">{formatDuration(row.durationSec)}</span>
            </button>
          );
        })}
      </div>

      {playingId && grant?.url && (
        <audio
          key={playingId}
          ref={audioRef}
          src={grant.url}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlayingId(null)}
          className="hidden"
        />
      )}
    </section>
  );
}
