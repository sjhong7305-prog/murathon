import Link from "next/link";
import { Artist } from "@muraton/shared/types";
import { CoverArt } from "./cover-art";

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="group flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition hover:bg-surface"
    >
      <div className="w-full max-w-20">
        <CoverArt
          gradient={artist.coverColor}
          label={artist.name}
          imageUrl={artist.imageUrl}
          rounded="rounded-full"
          hideLabel
          initial={artist.name.charAt(0).toUpperCase()}
        />
      </div>
      <div className="min-w-0 w-full">
        <h3 className="truncate text-xs font-bold text-ink group-hover:underline">
          {artist.name}
        </h3>
        {artist.genre && (
          <p className="truncate text-[10px] text-muted">{artist.genre}</p>
        )}
      </div>
    </Link>
  );
}
