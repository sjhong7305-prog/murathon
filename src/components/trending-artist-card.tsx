import Link from "next/link";
import Image from "next/image";
import { Artist } from "@/lib/types";
import { getProductsByArtist } from "@/lib/data";

export async function TrendingArtistCard({ artist }: { artist: Artist }) {
  const albums = (await getProductsByArtist(artist.id)).filter((p) => p.imageUrl).slice(0, 3);

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="group block w-48 shrink-0 overflow-visible rounded-2xl border border-line bg-surface shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-56"
    >
      <div className="relative aspect-[3/4] w-full">
        {artist.imageUrl ? (
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            sizes="224px"
            className="rounded-t-2xl object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full rounded-t-2xl bg-gradient-to-br ${artist.coverColor}`} />
        )}
        <div
          aria-hidden
          className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-black/85 via-black/10 to-transparent"
        />
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-orange-500 to-accent px-2 py-1 text-[10px] font-bold tracking-wide text-white shadow">
          🔥 TRENDING
        </span>
      </div>

      <div className="relative rounded-b-2xl px-3 pb-3 pt-8">
        {albums.length > 0 && (
          <div className="absolute -top-6 right-3 z-10 flex">
            {albums.map((album, i) => (
              <div
                key={album.id}
                className="relative -ml-4 h-12 w-12 overflow-hidden rounded-lg border border-line bg-surface shadow-xl ring-2 ring-surface backdrop-blur-sm transition duration-300 first:ml-0 group-hover:-translate-y-1.5 group-hover:scale-105"
                style={{ zIndex: albums.length - i, transitionDelay: `${i * 60}ms` }}
              >
                <Image src={album.imageUrl!} alt={album.title} fill sizes="48px" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <h3 className="truncate font-bold text-ink group-hover:underline">{artist.name}</h3>
        <p className="truncate text-xs text-muted">{artist.genre}</p>
      </div>
    </Link>
  );
}
