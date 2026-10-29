"use client";

import Link from "next/link";
import { Pause, Play, Quote } from "lucide-react";
import { CoverThumb } from "@/components/cover-thumb";
import { formatWon } from "@muraton/shared/format";
import type { FanVoice } from "@/lib/home-types";
import { useHomeTrackPlayer } from "@/lib/use-home-track-player";

const MAX_MESSAGE_LENGTH = 120;
const MIN_VOICES = 3;

/** Low-saturation backgrounds, rotated so the wall has rhythm without getting loud. */
const CARD_TONES = ["bg-surface", "bg-lime/15", "bg-orange/10"] as const;

function clip(message: string) {
  return message.length > MAX_MESSAGE_LENGTH ? `${message.slice(0, MAX_MESSAGE_LENGTH).trimEnd()}…` : message;
}

export function FanVoices({ voices }: { voices: FanVoice[] }) {
  if (voices.length < MIN_VOICES) return null;

  return (
    <ul className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:block sm:columns-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:columns-3">
      {voices.map((voice, i) => (
        <li key={voice.id} className="w-[82%] shrink-0 snap-start sm:mb-4 sm:w-auto sm:break-inside-avoid">
          <FanVoiceCard voice={voice} tone={CARD_TONES[i % CARD_TONES.length]} />
        </li>
      ))}
    </ul>
  );
}

function FanVoiceCard({ voice, tone }: { voice: FanVoice; tone: string }) {
  const { isPlaying, onPlayClick } = useHomeTrackPlayer(voice);

  return (
    <Link
      href={`/products/${voice.productId}`}
      className={`group flex h-full flex-col rounded-2xl p-5 transition-transform duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:p-6 ${tone}`}
    >
      <Quote aria-hidden className="size-6 fill-ink text-ink" />
      <blockquote className="mt-3 text-base leading-relaxed font-semibold text-ink [word-break:keep-all] sm:text-[17px]">
        {clip(voice.message)}
      </blockquote>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold text-ink">— {voice.supporter}</span>
        {voice.amount !== undefined && voice.amount > 0 && (
          <span className="rounded-full border border-orange px-2 py-0.5 text-xs font-black text-ink tabular-nums">
            {formatWon(voice.amount)}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3 pt-1">
        <CoverThumb imageUrl={voice.imageUrl} coverColor={voice.coverColor} sizes="40px" className="size-10 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink group-hover:underline">{voice.title}</p>
          <p className="truncate text-xs text-muted">{voice.artistName}</p>
        </div>
        {voice.playable && (
          <button
            type="button"
            onClick={onPlayClick}
            aria-label={isPlaying ? `${voice.title} 일시정지` : `${voice.title} 미리듣기`}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-cream transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {isPlaying ? <Pause aria-hidden className="size-3.5 fill-current" /> : <Play aria-hidden className="ml-0.5 size-3.5 fill-current" />}
          </button>
        )}
      </div>
    </Link>
  );
}
