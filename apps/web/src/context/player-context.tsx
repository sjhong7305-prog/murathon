"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

export interface PlayerTrack {
  /** The release (album/track product) this audio belongs to: likes, links and purchase CTAs use it. */
  productId: string;
  title: string;
  artistName: string;
  artistSlug: string;
  coverColor: string;
  imageUrl?: string | null;
  /** Unique id for this playable item. Album tracks share their album's productId, so they set this. */
  key?: string;
  /** Stream-grant endpoint. Defaults to the product's own `/api/products/:id/stream`. */
  streamPath?: string;
  durationSec?: number;
}

interface StreamGrant {
  url: string | null;
  mode: "full" | "preview";
  previewLimitSeconds: number;
}

interface PlayerContextValue {
  queue: PlayerTrack[];
  currentIndex: number;
  current: PlayerTrack | null;
  playing: boolean;
  grant: StreamGrant | null;
  previewEnded: boolean;
  volume: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  playOne: (track: PlayerTrack) => void;
  playAt: (index: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  close: () => void;
}

/** Playback position, split out because it changes several times a second: only the progress UI should re-render. */
interface PlayerProgressValue {
  currentTime: number;
  /** Playable length: the preview limit for preview grants, otherwise the file's duration. */
  duration: number;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);
const PlayerProgressContext = createContext<PlayerProgressValue>({ currentTime: 0, duration: 0 });

const VOLUME_STORAGE_KEY = "muraton-player-volume";

export function trackKey(track: PlayerTrack) {
  return track.key ?? track.productId;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [grant, setGrant] = useState<StreamGrant | null>(null);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fileDuration, setFileDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const current = currentIndex >= 0 ? queue[currentIndex] ?? null : null;
  const currentKey = current ? trackKey(current) : null;
  const duration =
    grant?.mode === "preview" && fileDuration > 0
      ? Math.min(fileDuration, grant.previewLimitSeconds)
      : fileDuration || current?.durationSec || 0;

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(VOLUME_STORAGE_KEY));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved volume after hydration
      if (saved > 0 && saved <= 1) setVolumeState(saved);
    } catch {
      // storage unavailable: keep full volume
    }
  }, []);

  useEffect(() => {
    if (!current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale grant once the queue empties
      setGrant(null);
      return;
    }
    setGrant(null);
    setPreviewEnded(false);
    setCurrentTime(0);
    setFileDuration(0);
    let cancelled = false;
    fetch(current.streamPath ?? `/api/products/${current.productId}/stream`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setGrant(data);
      })
      .catch(() => {
        if (!cancelled) setGrant(null);
      });
    return () => {
      cancelled = true;
    };
    // Re-fetches only when the playable item itself changes, not on every queue/index re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  const playQueue = (tracks: PlayerTrack[], startIndex = 0) => {
    setQueue(tracks);
    setCurrentIndex(startIndex);
    setPlaying(true);
  };

  const playOne = (track: PlayerTrack) => playQueue([track], 0);

  const playAt = (index: number) => {
    if (index < 0 || index >= queue.length) return;
    if (index === currentIndex) {
      const audio = audioRef.current;
      if (audio) audio.currentTime = 0;
      audio?.play().catch(() => {});
      return;
    }
    setCurrentIndex(index);
    setPlaying(true);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (previewEnded) setPreviewEnded(false);
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const next = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((i) => i + 1);
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const prev = () => {
    const audio = audioRef.current;
    // Like most players: "previous" first restarts the current song unless it just started.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setPlaying(true);
    } else if (audio) {
      audio.currentTime = 0;
    }
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min(seconds, duration || seconds));
    audio.currentTime = target;
    setCurrentTime(target);
    if (previewEnded) setPreviewEnded(false);
  };

  const setVolume = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
    try {
      if (clamped > 0) window.localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
    } catch {
      // storage unavailable: volume still applies for this session
    }
  };

  const close = () => {
    setQueue([]);
    setCurrentIndex(-1);
    setPlaying(false);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !grant) return;
    setCurrentTime(audio.currentTime);
    if (grant.mode === "preview" && audio.currentTime >= grant.previewLimitSeconds) {
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0);
      setPreviewEnded(true);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentIndex,
        current,
        playing,
        grant,
        previewEnded,
        volume,
        audioRef,
        playQueue,
        playOne,
        playAt,
        toggle,
        next,
        prev,
        seek,
        setVolume,
        close,
      }}
    >
      <PlayerProgressContext.Provider value={{ currentTime, duration }}>
        {children}
      </PlayerProgressContext.Provider>
      {current && grant?.url && (
        <audio
          key={currentKey}
          ref={audioRef}
          src={grant.url}
          autoPlay={playing}
          onLoadedMetadata={(e) => {
            e.currentTarget.volume = volume;
            setFileDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0);
          }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={next}
          className="hidden"
        />
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function usePlayerProgress() {
  return useContext(PlayerProgressContext);
}
