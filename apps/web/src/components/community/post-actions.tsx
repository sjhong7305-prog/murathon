"use client";

import { useState } from "react";
import Link from "next/link";

function seededScore(seed: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

export function PostActions({ postId, commentCount }: { postId: string; commentCount: number }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const baseScore = seededScore(postId, 3, 48);
  const score = baseScore + (vote === "up" ? 1 : vote === "down" ? -1 : 0);

  const handleVote = (e: React.MouseEvent, next: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();
    setVote((prev) => (prev === next ? null : next));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/community/${postId}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-3 flex items-center gap-2 text-sm">
      <div className="flex items-center overflow-hidden rounded-full border border-line">
        <button
          type="button"
          onClick={(e) => handleVote(e, "up")}
          aria-label="추천"
          className={`px-2.5 py-1.5 font-bold transition ${
            vote === "up" ? "bg-accent/15 text-accent-strong" : "text-muted hover:text-ink"
          }`}
        >
          ▲
        </button>
        <span className="min-w-[1.5rem] px-1 text-center font-bold text-ink">{score}</span>
        <button
          type="button"
          onClick={(e) => handleVote(e, "down")}
          aria-label="비추천"
          className={`px-2.5 py-1.5 font-bold transition ${
            vote === "down" ? "bg-sky-400/15 text-sky-700" : "text-muted hover:text-ink"
          }`}
        >
          ▼
        </button>
      </div>

      <Link
        href={`/community/${postId}`}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-semibold text-muted transition hover:border-black/20 hover:text-ink"
      >
        💬 {commentCount}
      </Link>

      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-semibold text-muted transition hover:border-black/20 hover:text-ink"
      >
        {copied ? "링크 복사됨 ✓" : "🔗 공유"}
      </button>
    </div>
  );
}
