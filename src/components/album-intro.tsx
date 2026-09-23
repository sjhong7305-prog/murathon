"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";

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
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold text-ink">앨범 소개</h2>
      <p
        className={`whitespace-pre-wrap text-sm leading-relaxed text-ink ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {longDescription}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-xs font-semibold text-accent-strong hover:underline"
      >
        {expanded ? "접기" : "더보기"}
      </button>

      {meta.length > 0 && (
        <p className="mt-4 text-xs text-muted">{meta.join(" · ")}</p>
      )}
    </section>
  );
}
