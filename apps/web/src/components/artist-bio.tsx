"use client";

import { useState } from "react";

/** Sidebar artist bio: clamps to 5 lines with a "더 보기" toggle, same pattern as AlbumIntro. */
export function ArtistBio({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`whitespace-pre-wrap text-sm leading-relaxed ${expanded ? "" : "line-clamp-5"}`}
        style={{ color: "var(--artist-card-text)" }}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1.5 text-xs font-semibold hover:underline"
        style={{ color: "var(--artist-accent)" }}
      >
        {expanded ? "접기" : "더 보기"}
      </button>
    </div>
  );
}
