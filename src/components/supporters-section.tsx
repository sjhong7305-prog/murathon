"use client";

import { useEffect, useState } from "react";
import { getLocalSupporters } from "@/lib/supporters-storage";

export function SupportersSection({
  artistId,
  baseSupporters,
}: {
  artistId: string;
  baseSupporters: string[];
}) {
  const [names, setNames] = useState<string[]>(baseSupporters);

  useEffect(() => {
    const local = getLocalSupporters(artistId);
    if (local.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- merge in locally-added supporters saved from a prior checkout
    setNames((prev) => Array.from(new Set([...prev, ...local])));
  }, [artistId]);

  if (names.length === 0) return null;

  return (
    <section id="supporters" className="mt-12 scroll-mt-20">
      <h2 className="mb-1 text-lg font-bold text-ink">🏆 디지털 명예의 전당</h2>
      <p className="mb-4 text-sm text-muted">이 아티스트를 직접 후원한 서포터들이에요.</p>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <span
            key={name}
            className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent-strong"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
