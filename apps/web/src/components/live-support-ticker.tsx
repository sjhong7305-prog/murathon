"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { CoverThumb } from "@/components/cover-thumb";
import { formatWon } from "@muraton/shared/format";
import type { HomeTrack, LiveSupport } from "@/lib/home-types";
import { useHomeTrackPlayer } from "@/lib/use-home-track-player";

const POLL_MS = 30_000;
const BACKOFF_POLL_MS = 120_000;
const MAX_FAILURES_BEFORE_BACKOFF = 3;
const FRESH_HIGHLIGHT_MS = 2_000;
/** Below this many real supports, new releases are mixed in so the strip never looks empty. */
const MIN_SUPPORTS = 5;
/** Each copy of the loop needs enough items to cover a wide screen without a gap. */
const MIN_ITEMS_PER_COPY = 10;

type TickerItem =
  | { kind: "support"; key: string; data: LiveSupport }
  | { kind: "release"; key: string; data: HomeTrack };

function relativeTime(iso: string, now: number) {
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function buildItems(supports: LiveSupport[], releases: HomeTrack[]): TickerItem[] {
  const items: TickerItem[] = supports.map((s) => ({ kind: "support", key: `s-${s.id}`, data: s }));
  if (supports.length >= MIN_SUPPORTS) return items;
  // Interleave new releases after each real support so live activity still reads first.
  const mixed: TickerItem[] = [];
  const maxLen = Math.max(items.length, releases.length);
  for (let i = 0; i < maxLen; i++) {
    if (items[i]) mixed.push(items[i]);
    if (releases[i]) mixed.push({ kind: "release", key: `r-${releases[i].productId}`, data: releases[i] });
  }
  return mixed;
}

export function LiveSupportTicker({
  initialSupports,
  releases,
  serverNow,
  demo = false,
}: {
  initialSupports: LiveSupport[];
  releases: HomeTrack[];
  /** Server render time, so relative times match between SSR and hydration. */
  serverNow: number;
  demo?: boolean;
}) {
  const [supports, setSupports] = useState(initialSupports);
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(new Set());
  const [now, setNow] = useState(serverNow);
  const knownIds = useRef(new Set(initialSupports.map((s) => s.id)));

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), POLL_MS);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (demo) return;
    let failures = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = () => {
      timer = setTimeout(poll, failures >= MAX_FAILURES_BEFORE_BACKOFF ? BACKOFF_POLL_MS : POLL_MS);
    };

    const poll = async () => {
      if (document.visibilityState !== "visible") return schedule();
      try {
        const res = await fetch("/api/live-supports");
        if (!res.ok) throw new Error(String(res.status));
        const next: LiveSupport[] = await res.json();
        if (cancelled) return;
        failures = 0;
        const added = next.filter((s) => !knownIds.current.has(s.id)).map((s) => s.id);
        knownIds.current = new Set(next.map((s) => s.id));
        setSupports(next);
        setNow(Date.now());
        if (added.length > 0) {
          setFreshIds(new Set(added));
          setTimeout(() => !cancelled && setFreshIds(new Set()), FRESH_HIGHLIGHT_MS);
        }
      } catch {
        // Keep showing the last good list; slow down after repeated failures.
        failures += 1;
      }
      if (!cancelled) schedule();
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [demo]);

  const items = buildItems(supports, releases);
  if (items.length === 0) return null;

  const isLive = supports.length > 0;
  const repeat = Math.ceil(MIN_ITEMS_PER_COPY / items.length);
  const copyItems = Array.from({ length: repeat }, () => items).flat();

  return (
    <section
      aria-label={isLive ? "방금 응원받은 음악" : "막 공개된 음악"}
      className="relative flex items-stretch overflow-hidden rounded-2xl bg-surface"
    >
      <div className="relative z-10 flex shrink-0 items-center gap-2.5 bg-tone py-3 pr-4 pl-4 sm:pr-5">
        <span aria-hidden className="relative flex size-2.5">
          {isLive && <span className="live-dot absolute inset-0 rounded-full bg-lime" />}
          <span className={`relative size-2.5 rounded-full ${isLive ? "bg-lime ring-1 ring-ink/20" : "bg-ink"}`} />
        </span>
        <p className="text-sm font-bold whitespace-nowrap text-ink">
          <span className="sm:hidden">{isLive ? "실시간" : "신곡"}</span>
          <span className="hidden sm:inline">{isLive ? "방금 응원받은 음악" : "막 공개된 음악"}</span>
        </p>
      </div>

      <div className="live-ticker-viewport min-w-0 flex-1 overflow-hidden py-3">
        <div className="live-ticker-track flex w-max">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              inert={copy === 1}
              className={`flex shrink-0 gap-2 pr-2 pl-2 ${copy === 1 ? "live-ticker-clone" : ""}`}
            >
              {copyItems.map((item, i) => (
                <li key={`${copy}-${i}-${item.key}`} className="shrink-0">
                  <TickerEntry item={item} now={now} fresh={item.kind === "support" && freshIds.has(item.data.id)} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function TickerEntry({ item, now, fresh }: { item: TickerItem; now: number; fresh: boolean }) {
  const track = item.data;
  const { isCurrent, isPlaying, onPlayClick } = useHomeTrackPlayer(track);

  return (
    <Link
      href={`/products/${track.productId}`}
      className={`group flex max-w-[22rem] items-center gap-2.5 rounded-lg py-1 pr-3 pl-1 transition-colors duration-700 hover:bg-surface focus-visible:outline-2 focus-visible:outline-ink ${
        fresh ? "bg-lime/40" : ""
      }`}
    >
      <div className="relative size-9 shrink-0">
        <CoverThumb imageUrl={track.imageUrl} coverColor={track.coverColor} sizes="36px" className="rounded-md" />
        {track.playable && (
          <button
            type="button"
            onClick={onPlayClick}
            aria-label={isPlaying ? `${track.title} 일시정지` : `${track.title} 미리듣기`}
            className={`absolute inset-0 grid place-items-center rounded-md bg-ink/55 text-cream transition-opacity focus-visible:opacity-100 ${
              isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isPlaying ? <Pause aria-hidden className="size-3.5 fill-current" /> : <Play aria-hidden className="size-3.5 fill-current" />}
          </button>
        )}
      </div>

      <p className="min-w-0 truncate text-[13px] text-muted">
        {item.kind === "support" ? (
          <>
            <span className="font-bold text-ink">{item.data.supporter ?? "익명의 팬"}</span>님이{" "}
            <span className="font-semibold text-ink">{track.title}</span>에{" "}
            <span className="font-black text-ink">{formatWon(item.data.amount)}</span> 응원
            <span className="ml-1.5 text-[11px] text-muted/80">
              {relativeTime(item.data.createdAt, now)} · {track.artistName}
            </span>
          </>
        ) : (
          <>
            <span className="mr-1.5 rounded-full bg-lime px-1.5 py-px text-[11px] font-bold text-ink">신곡</span>
            <span className="font-semibold text-ink">{track.title}</span>
            <span className="ml-1.5 text-[11px]">{track.artistName}</span>
          </>
        )}
      </p>
    </Link>
  );
}
