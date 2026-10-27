"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play, Shuffle } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { CoverThumb } from "@/components/cover-thumb";
import type { HomeTrack } from "@/lib/home-types";
import { toPlayerTrack } from "@/lib/use-home-track-player";

const MIX_SIZE = 8;
const MIN_MIX_SIZE = 3;

/** One release per artist, in pool order. Deterministic so SSR and hydration agree. */
function pickMix(pool: HomeTrack[]): HomeTrack[] {
  const seen = new Set<string>();
  const mix: HomeTrack[] = [];
  for (const track of pool) {
    if (seen.has(track.artistId)) continue;
    seen.add(track.artistId);
    mix.push(track);
    if (mix.length === MIX_SIZE) break;
  }
  // Small catalogs: allow repeat artists rather than showing a near-empty mix.
  for (const track of pool) {
    if (mix.length >= MIX_SIZE) break;
    if (!mix.includes(track)) mix.push(track);
  }
  return mix;
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function DigMix({ candidates }: { candidates: HomeTrack[] }) {
  const { queue, currentIndex, playing, previewEnded, playQueue, toggle, next } = usePlayer();
  const [mix, setMix] = useState(() => pickMix(candidates));

  // The player queue is "this mix" when it holds exactly these releases in this order.
  const mixKey = mix.map((t) => t.productId).join("|");
  const isActive = queue.length > 0 && queue.map((t) => t.productId).join("|") === mixKey;
  const activeIndex = isActive ? currentIndex : -1;
  const nowPlaying = activeIndex >= 0 ? mix[activeIndex] : null;
  const isAtEnd = isActive && activeIndex === mix.length - 1 && !playing;

  // Previews stop at 30s without firing `ended`, so the mix advances itself. `previewEnded` stays
  // true for a render after the index changes, so wait for it to reset before advancing again.
  const awaitingReset = useRef(false);
  useEffect(() => {
    if (!previewEnded) {
      awaitingReset.current = false;
      return;
    }
    if (!isActive || awaitingReset.current || activeIndex >= mix.length - 1) return;
    awaitingReset.current = true;
    next();
  }, [isActive, previewEnded, activeIndex, mix.length, next]);

  const start = (index = 0, tracks = mix) => playQueue(tracks.map(toPlayerTrack), index);

  const reshuffle = (autoplay: boolean) => {
    const nextMix = pickMix(shuffled(candidates));
    setMix(nextMix);
    if (autoplay) start(0, nextMix);
  };

  const primaryLabel = useMemo(() => {
    if (!isActive) return "디깅 시작";
    return playing ? "일시정지" : "이어서 듣기";
  }, [isActive, playing]);

  if (mix.length < MIN_MIX_SIZE) return null;

  return (
    <section aria-labelledby="dig-mix-title" className="mt-20 sm:mt-24">
      <div className="overflow-hidden rounded-3xl bg-ink text-cream">
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-6 lg:p-14">
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-lime">MU:RATHON MIX</p>
            <h2 id="dig-mix-title" className="mt-3 text-4xl leading-none font-black tracking-tight sm:text-5xl">
              Dig in 30s
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/65 sm:text-base">
              {`미리듣기 30초씩, ${mix.length}곡을 연속으로. 고르지 말고 일단 들어보세요.`}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => (isActive ? toggle() : start())}
                className="inline-flex items-center gap-2.5 rounded-full bg-lime px-6 py-3.5 text-sm font-black text-ink transition hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                {isActive && playing ? (
                  <Pause aria-hidden className="size-4 fill-current" />
                ) : (
                  <Play aria-hidden className="size-4 fill-current" />
                )}
                {primaryLabel}
              </button>
              <button
                type="button"
                onClick={() => reshuffle(isActive)}
                className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-4 py-3 text-sm font-bold text-cream/85 transition hover:border-cream/60 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                <Shuffle aria-hidden className="size-4" />
                {isAtEnd ? "다른 조합으로 계속 디깅" : "다른 조합"}
              </button>
            </div>

            <div className="mt-8 min-h-[3.25rem] border-t border-cream/15 pt-4" aria-live="polite">
              {nowPlaying ? (
                <div className="flex items-baseline justify-between gap-4">
                  <p className="min-w-0 truncate text-sm">
                    <span className="text-cream/50">지금 재생 중 </span>
                    <Link href={`/products/${nowPlaying.productId}`} className="font-bold hover:underline">
                      {nowPlaying.title}
                    </Link>
                    <span className="text-cream/50"> · {nowPlaying.artistName}</span>
                  </p>
                  <span className="shrink-0 font-mono text-xs text-cream/50 tabular-nums">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(mix.length).padStart(2, "0")}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-cream/45">커버를 누르면 그 곡부터 시작해요.</p>
              )}
            </div>
          </div>

          <ol className="scrollbar-hide -mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 lg:mx-0 lg:justify-center lg:gap-0 lg:overflow-visible lg:px-0 lg:py-6">
            {mix.map((track, i) => {
              const isNow = i === activeIndex;
              const offset = i - (mix.length - 1) / 2;
              return (
                <li
                  key={track.productId}
                  className="w-28 shrink-0 snap-start sm:w-32 lg:-ml-12 lg:w-36 lg:first:ml-0"
                  style={{ zIndex: isNow ? 20 : 10 - Math.abs(Math.round(offset)) }}
                >
                  <button
                    type="button"
                    onClick={() => (isNow ? toggle() : start(i))}
                    aria-label={`${track.title} · ${track.artistName}부터 재생`}
                    aria-current={isNow || undefined}
                    className={`dig-cover group relative block w-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime lg:[transform:rotate(var(--tilt))_translateY(var(--lift))] lg:hover:[--lift:-12px] ${
                      isNow ? "lg:[--lift:-20px] shadow-[0_0_0_3px_var(--lime),0_18px_40px_rgba(0,0,0,0.5)]" : "lg:[--lift:0px] shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                    }`}
                    style={{ ["--tilt" as string]: `${offset * 3}deg` }}
                  >
                    <CoverThumb
                      imageUrl={track.imageUrl}
                      coverColor={track.coverColor}
                      sizes="144px"
                      className="rounded-xl"
                    />
                    <span
                      className={`absolute right-2 bottom-2 grid size-8 place-items-center rounded-full bg-lime text-ink transition ${
                        isNow ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                      }`}
                    >
                      {isNow && playing ? (
                        <Pause aria-hidden className="size-3.5 fill-current" />
                      ) : (
                        <Play aria-hidden className="ml-0.5 size-3.5 fill-current" />
                      )}
                    </span>
                  </button>
                  <p className="mt-2 truncate text-xs font-bold lg:hidden">{track.title}</p>
                  <p className="truncate text-[11px] text-cream/50 lg:hidden">{track.artistName}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
