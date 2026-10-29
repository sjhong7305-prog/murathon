"use client";

import { useState } from "react";
import { formatDate } from "@muraton/shared/format";

function formatReleaseDate(iso: string) {
  const formatted = formatDate(iso);
  return formatted === "-" ? formatted : `${formatted} 발매`;
}

export function AlbumIntro({
  longDescription,
  releaseDate,
  genre,
  credits,
}: {
  longDescription?: string;
  releaseDate?: string;
  genre?: string;
  credits?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!longDescription) return null;

  const meta = [releaseDate ? formatReleaseDate(releaseDate) : null, genre, credits].filter(Boolean);

  return (
    <section className="mt-14">
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">앨범 소개</h2>
      <p
        className={`max-w-[65ch] whitespace-pre-wrap text-[15px] leading-relaxed text-ink/85 ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {longDescription}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent-strong hover:underline"
      >
        {expanded ? "접기" : "더보기"}
      </button>

      {meta.length > 0 && (
        <p className="mt-4 text-xs text-muted">{meta.join(" · ")}</p>
      )}
    </section>
  );
}
