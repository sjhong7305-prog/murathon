"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  ListMusic,
  Lock,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { trackKey, usePlayer, usePlayerProgress } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import { formatDuration } from "@muraton/shared/format";

function clock(seconds: number) {
  return formatDuration(Math.floor(seconds));
}

/** The current release's like state, synced with /api/products/:id/like. */
function useProductLike(productId: string | undefined) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    fetch(`/api/products/${productId}/like`)
      .then((res) => (res.ok ? res.json() : { liked: false }))
      .then((data: { liked: boolean }) => !cancelled && setLiked(data.liked))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const toggleLike = async () => {
    if (!productId) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    const res = await fetch(`/api/products/${productId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked: nextLiked }),
    }).catch(() => null);
    if (res?.status === 401) {
      setLiked(false);
      router.push("/login?message=" + encodeURIComponent("좋아요를 누르려면 로그인이 필요해요."));
    } else if (!res?.ok) {
      setLiked(!nextLiked);
    }
  };

  return { liked, toggleLike };
}

/** Seek bar: a native range input (keyboard + screen reader support) laid over a custom track. */
function ProgressBar({ size }: { size: "compact" | "large" }) {
  const { seek, grant } = usePlayer();
  const { currentTime, duration } = usePlayerProgress();
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const disabled = !grant?.url || duration === 0;

  return (
    <div
      className={`group relative flex w-full items-center ${size === "large" ? "h-11" : "h-6"} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="relative h-1 w-full rounded-full bg-ink/12 group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-4 group-has-[:focus-visible]:outline-ink">
        <div className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${percent}%` }} />
        <div
          className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-sm transition-opacity ${
            size === "large" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          style={{ left: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => seek(Number(e.target.value))}
        disabled={disabled}
        aria-label="재생 위치"
        aria-valuetext={`${clock(currentTime)} / ${clock(duration)}`}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-default"
      />
    </div>
  );
}

function TimeLabels() {
  const { currentTime, duration } = usePlayerProgress();
  return (
    <div className="flex justify-between text-xs font-medium text-muted tabular-nums">
      <span>{clock(currentTime)}</span>
      <span>{duration > 0 ? clock(duration) : "-:--"}</span>
    </div>
  );
}

function PlayPauseButton({ size }: { size: "sm" | "md" | "lg" }) {
  const { playing, toggle, grant } = usePlayer();
  const dims = { sm: "size-11", md: "size-11", lg: "size-18" }[size];
  const icon = size === "lg" ? "size-7" : "size-4";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!grant?.url}
      aria-label={playing ? "일시정지" : "재생"}
      className={`grid ${dims} shrink-0 place-items-center rounded-full bg-ink text-cream transition hover:scale-[1.04] disabled:opacity-40`}
    >
      {playing ? (
        <Pause aria-hidden className={`${icon} fill-current`} />
      ) : (
        <Play aria-hidden className={`${icon} translate-x-px fill-current`} />
      )}
    </button>
  );
}

function SkipButtons({ children }: { children: React.ReactNode }) {
  const { prev, next, currentIndex, queue } = usePlayer();
  const hasNext = currentIndex < queue.length - 1;
  const iconButton =
    "grid size-11 shrink-0 place-items-center rounded-full text-ink transition hover:bg-ink/6 disabled:opacity-30";
  return (
    <>
      <button type="button" onClick={prev} aria-label="이전 곡" className={iconButton}>
        <SkipBack aria-hidden className="size-5 fill-current" />
      </button>
      {children}
      <button type="button" onClick={next} disabled={!hasNext} aria-label="다음 곡" className={iconButton}>
        <SkipForward aria-hidden className="size-5 fill-current" />
      </button>
    </>
  );
}

function LikeButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { liked, toggleLike } = useProductLike(productId);
  return (
    <button
      type="button"
      onClick={toggleLike}
      aria-pressed={liked}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className={`grid size-11 shrink-0 place-items-center rounded-full transition hover:bg-ink/6 ${
        liked ? "text-orange" : "text-muted hover:text-ink"
      } ${className}`}
    >
      <Heart aria-hidden className={`size-5 ${liked ? "fill-current" : ""}`} />
    </button>
  );
}

function VolumeControl() {
  const { volume, setVolume } = usePlayer();
  const [lastVolume, setLastVolume] = useState(1);
  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          if (volume > 0) {
            setLastVolume(volume);
            setVolume(0);
          } else {
            setVolume(lastVolume || 1);
          }
        }}
        aria-label={volume === 0 ? "음소거 해제" : "음소거"}
        className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-ink/6 hover:text-ink"
      >
        <Icon aria-hidden className="size-5" />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="볼륨"
        className="h-1 w-24 cursor-pointer accent-ink"
      />
    </div>
  );
}

function PreviewNotice({ className = "" }: { className?: string }) {
  const { grant, previewEnded, current } = usePlayer();
  if (grant?.mode !== "preview" || !current) return null;
  return (
    <p className={`flex items-center gap-1.5 text-xs text-muted ${className}`}>
      <Lock aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">
        {previewEnded ? "미리듣기가 끝났어요." : `미리듣기 ${grant.previewLimitSeconds}초.`}{" "}
        <Link href={`/products/${current.productId}`} className="font-bold text-accent-strong hover:underline">
          후원하고 전곡 듣기
        </Link>
      </span>
    </p>
  );
}

function QueueList({ onPick }: { onPick?: () => void }) {
  const { queue, currentIndex, playAt, playing } = usePlayer();
  return (
    <ol className="flex flex-col">
      {queue.map((track, i) => {
        const isNow = i === currentIndex;
        return (
          <li key={`${trackKey(track)}-${i}`}>
            <button
              type="button"
              onClick={() => {
                playAt(i);
                onPick?.();
              }}
              aria-current={isNow || undefined}
              className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-2 text-left transition hover:bg-ink/5 ${
                isNow ? "bg-lime/25" : ""
              }`}
            >
              <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted tabular-nums">
                {isNow && playing ? <Play aria-hidden className="mx-auto size-3 fill-ink text-ink" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{track.title}</span>
                <span className="block truncate text-xs text-muted">{track.artistName}</span>
              </span>
              {track.durationSec ? (
                <span className="shrink-0 text-xs text-muted tabular-nums">{formatDuration(track.durationSec)}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Large player for phones: artwork, seek bar and full controls in a full-screen sheet. */
function MobilePlayerSheet({ onClose }: { onClose: () => void }) {
  const { current, queue } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="플레이어"
      className="player-sheet fixed inset-0 z-50 flex flex-col bg-cream px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label="플레이어 닫기"
          className="-ml-2 grid size-11 place-items-center rounded-full text-ink transition hover:bg-ink/6"
        >
          <ChevronDown aria-hidden className="size-6" />
        </button>
        <p className="text-xs font-bold tracking-[0.14em] text-muted">NOW PLAYING</p>
        <button
          type="button"
          onClick={() => setShowQueue((v) => !v)}
          aria-pressed={showQueue}
          aria-label="재생 목록"
          className={`-mr-2 grid size-11 place-items-center rounded-full transition hover:bg-ink/6 ${
            showQueue ? "bg-lime text-ink" : "text-ink"
          }`}
        >
          <ListMusic aria-hidden className="size-5" />
        </button>
      </div>

      {showQueue ? (
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <p className="mb-2 px-2 text-sm font-bold text-ink">재생 목록 {queue.length}곡</p>
          <QueueList onPick={() => setShowQueue(false)} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center py-6">
          <div className="aspect-square w-full max-w-[min(100%,46dvh)] overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(28,27,24,0.28)]">
            <CoverArt
              gradient={current.coverColor}
              label={current.title}
              imageUrl={current.imageUrl ?? undefined}
              hideLabel
              rounded="rounded-3xl"
              sizes="(max-width: 768px) 90vw, 400px"
            />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl leading-tight font-bold tracking-tight text-ink">{current.title}</p>
          <Link
            href={`/artists/${current.artistSlug}`}
            onClick={onClose}
            className="mt-1 block truncate text-base text-muted hover:text-ink"
          >
            {current.artistName}
          </Link>
        </div>
        <LikeButton productId={current.productId} className="-mr-2" />
      </div>

      <div className="mt-4">
        <ProgressBar size="large" />
        <TimeLabels />
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <SkipButtons>
          <PlayPauseButton size="lg" />
        </SkipButtons>
      </div>

      <PreviewNotice className="mt-6 justify-center" />
    </div>
  );
}

export function MiniPlayer() {
  const { current, grant, close } = usePlayer();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  useEffect(() => {
    if (!queueOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setQueueOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queueOpen]);

  if (!current) return null;

  const cover = (size: string) => (
    <CoverArt
      gradient={current.coverColor}
      label={current.title}
      imageUrl={current.imageUrl ?? undefined}
      hideLabel
      rounded="rounded-lg"
      sizes={size}
    />
  );

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(28,27,24,0.06)] backdrop-blur-xl">
        {/* Mobile: slim bar. Tapping anywhere but the play button opens the full-screen player. */}
        <div className="md:hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0">
            <MobileProgressLine />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label={`${current.title} 플레이어 열기`}
              className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="w-11 shrink-0">{cover("44px")}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-ink">{current.title}</span>
                <span className="block truncate text-xs text-muted">
                  {grant?.mode === "preview" ? `미리듣기 · ${current.artistName}` : current.artistName}
                </span>
              </span>
            </button>
            <PlayPauseButton size="sm" />
          </div>
        </div>

        {/* Desktop: track info / transport + seek / volume + queue. */}
        <div className="mx-auto hidden max-w-7xl grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)] items-center gap-6 px-4 py-2.5 md:grid">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/products/${current.productId}`} className="w-14 shrink-0" aria-label={`${current.title} 페이지`}>
              {cover("56px")}
            </Link>
            <div className="min-w-0">
              <Link
                href={`/products/${current.productId}`}
                className="block truncate text-sm font-bold text-ink hover:underline"
              >
                {current.title}
              </Link>
              <Link
                href={`/artists/${current.artistSlug}`}
                className="block truncate text-xs text-muted hover:text-ink"
              >
                {current.artistName}
              </Link>
            </div>
            <LikeButton productId={current.productId} />
          </div>

          <div className="flex min-w-0 flex-col items-center">
            <div className="flex items-center gap-2">
              <SkipButtons>
                <PlayPauseButton size="md" />
              </SkipButtons>
            </div>
            <div className="flex w-full items-center gap-3">
              <DesktopTime which="current" />
              <ProgressBar size="compact" />
              <DesktopTime which="duration" />
            </div>
          </div>

          <div className="relative flex min-w-0 items-center justify-end gap-1">
            <PreviewNotice className="mr-2 hidden xl:flex" />
            <VolumeControl />
            <button
              type="button"
              onClick={() => setQueueOpen((v) => !v)}
              aria-pressed={queueOpen}
              aria-label="재생 목록"
              className={`grid size-11 place-items-center rounded-full transition hover:bg-ink/6 ${
                queueOpen ? "bg-lime text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <ListMusic aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="플레이어 닫기"
              className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-ink/6 hover:text-ink"
            >
              <X aria-hidden className="size-5" />
            </button>

            {queueOpen && (
              <div className="absolute right-0 bottom-full mb-3 w-96 rounded-2xl border border-line bg-surface p-3 shadow-[0_20px_50px_rgba(28,27,24,0.16)]">
                <p className="mb-1 px-2 text-sm font-bold text-ink">재생 목록</p>
                <div className="max-h-[50dvh] overflow-y-auto">
                  <QueueList />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sheetOpen && <MobilePlayerSheet onClose={() => setSheetOpen(false)} />}
    </>
  );
}

function DesktopTime({ which }: { which: "current" | "duration" }) {
  const { currentTime, duration } = usePlayerProgress();
  const value = which === "current" ? currentTime : duration;
  return (
    <span className="w-10 shrink-0 text-center text-[11px] font-medium text-muted tabular-nums">
      {which === "duration" && duration === 0 ? "-:--" : clock(value)}
    </span>
  );
}

/** Hairline progress along the top edge of the compact mobile bar (display only). */
function MobileProgressLine() {
  const { currentTime, duration } = usePlayerProgress();
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  return (
    <div className="h-0.5 w-full bg-transparent">
      <div className="h-full bg-ink" style={{ width: `${percent}%` }} />
    </div>
  );
}
