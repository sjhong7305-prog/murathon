"use client";

import { useEffect, useState } from "react";
import { getLocalIntroduction } from "@/lib/artist-profile-storage";

export function ArtistIntroduction({
  artistId,
  fallback,
}: {
  artistId: string;
  fallback: string;
}) {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    const local = getLocalIntroduction(artistId);
    if (local) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- swap in the artist's saved edit from localStorage post-mount
      setText(local);
    }
  }, [artistId]);

  return <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink">{text}</p>;
}
