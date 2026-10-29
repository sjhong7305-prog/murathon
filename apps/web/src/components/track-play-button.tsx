"use client";

import { Lock, Pause, Play } from "lucide-react";
import { usePlayer } from "@/context/player-context";

/** Plays a standalone uploaded track (/tracks/[id]) in the global bottom player. */
export function TrackPlayButton({
  trackId,
  title,
  artistName,
  artistSlug,
  imageUrl,
  limitSeconds,
}: {
  trackId: string;
  title: string;
  artistName: string;
  artistSlug: string;
  imageUrl?: string;
  limitSeconds: number;
}) {
  const { current, playing, playOne, toggle, previewEnded } = usePlayer();
  const key = `uploaded-track-${trackId}`;
  const isCurrent = current?.key === key;
  const isPlaying = isCurrent && playing;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() =>
          isCurrent
            ? toggle()
            : playOne({
                key,
                // Not a store product: the id only keys the item; links and likes are overridden below.
                productId: trackId,
                title,
                artistName,
                artistSlug,
                coverColor: "from-stone-700 to-stone-900",
                imageUrl,
                streamPath: `/api/tracks/${trackId}/stream`,
                href: `/tracks/${trackId}`,
                likeable: false,
              })
        }
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong"
      >
        {isPlaying ? <Pause aria-hidden className="size-4 fill-current" /> : <Play aria-hidden className="size-4 fill-current" />}
        {isPlaying ? "일시정지" : "미리듣기"}
      </button>
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Lock aria-hidden className="size-3.5" />
        {isCurrent && previewEnded ? "미리듣기가 끝났어요." : `미리듣기는 ${limitSeconds}초까지만 재생돼요.`}
      </p>
    </div>
  );
}
