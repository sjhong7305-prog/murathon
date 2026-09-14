"use client";

import { useRef, useState } from "react";

export function TrackPreviewPlayer({
  src,
  limitSeconds = 30,
}: {
  src?: string;
  limitSeconds?: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ended, setEnded] = useState(false);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime >= limitSeconds) {
      audio.pause();
      audio.currentTime = 0;
      setEnded(true);
    }
  };

  const handlePlay = () => setEnded(false);

  if (!src) {
    return (
      <p className="rounded-lg border border-dashed border-line bg-cream px-3 py-2 text-xs text-muted">
        아직 업로드된 미리듣기 파일이 없어요.
      </p>
    );
  }

  return (
    <div>
      <audio
        ref={audioRef}
        src={src}
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        className="w-full"
      />
      <p className="mt-1 text-xs text-muted">
        {ended
          ? "🔒 미리듣기 종료, 구매 후 전체 듣기"
          : `미리듣기는 ${limitSeconds}초까지만 재생돼요.`}
      </p>
    </div>
  );
}
