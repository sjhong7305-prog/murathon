"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

export interface PlayerTrack {
  productId: string;
  title: string;
  artistName: string;
  artistSlug: string;
  coverColor: string;
  imageUrl?: string | null;
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
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  playOne: (track: PlayerTrack) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [grant, setGrant] = useState<StreamGrant | null>(null);
  const [previewEnded, setPreviewEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const current = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  useEffect(() => {
    if (!current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale grant once the queue empties
      setGrant(null);
      return;
    }
    setPreviewEnded(false);
    let cancelled = false;
    fetch(`/api/products/${current.productId}/stream`)
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
    // Re-fetches only when the track itself changes, not on every queue/index re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.productId]);

  const playQueue = (tracks: PlayerTrack[], startIndex = 0) => {
    setQueue(tracks);
    setCurrentIndex(startIndex);
    setPlaying(true);
  };

  const playOne = (track: PlayerTrack) => playQueue([track], 0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
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
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setPlaying(true);
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
    if (grant.mode === "preview" && audio.currentTime >= grant.previewLimitSeconds) {
      audio.pause();
      audio.currentTime = 0;
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
        audioRef,
        playQueue,
        playOne,
        toggle,
        next,
        prev,
        close,
      }}
    >
      {children}
      {current && grant?.url && (
        <audio
          key={current.productId}
          ref={audioRef}
          src={grant.url}
          autoPlay={playing}
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
