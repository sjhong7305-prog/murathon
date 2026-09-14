"use client";

import { useState } from "react";

export function ReactionButtons({
  initialHeart,
  initialPray,
  compact = false,
}: {
  initialHeart: number;
  initialPray: number;
  compact?: boolean;
}) {
  const [heart, setHeart] = useState(initialHeart);
  const [pray, setPray] = useState(initialPray);
  const [heartActive, setHeartActive] = useState(false);
  const [prayActive, setPrayActive] = useState(false);

  const toggleHeart = () => {
    setHeart((n) => (heartActive ? n - 1 : n + 1));
    setHeartActive((a) => !a);
  };

  const togglePray = () => {
    setPray((n) => (prayActive ? n - 1 : n + 1));
    setPrayActive((a) => !a);
  };

  const sizeClasses = compact
    ? "gap-1 px-1.5 py-0.5 text-[11px]"
    : "gap-1.5 px-3 py-1.5 text-sm";

  return (
    <div className={`flex shrink-0 items-center ${compact ? "gap-1" : "gap-2"}`}>
      <button
        type="button"
        onClick={toggleHeart}
        className={`flex items-center rounded-full border font-semibold transition ${sizeClasses} ${
          heartActive
            ? "border-accent bg-accent/15"
            : "border-line hover:border-black/20"
        }`}
      >
        ❤️ <span className="text-ink">{heart}</span>
      </button>
      <button
        type="button"
        onClick={togglePray}
        className={`flex items-center rounded-full border font-semibold transition ${sizeClasses} ${
          prayActive
            ? "border-amber-500 bg-amber-400/15"
            : "border-line hover:border-black/20"
        }`}
      >
        🙏 <span className="text-ink">{pray}</span>
      </button>
    </div>
  );
}
