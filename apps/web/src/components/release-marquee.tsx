import Link from "next/link";
import Image from "next/image";

type Release = {
  id: string;
  title: string;
  artistId: string;
  coverColor: string; // Tailwind gradient classes, e.g. "from-lime-300 to-emerald-700"
  imageUrl?: string;
};

type Artist = { id: string; name: string };

export function ReleaseMarquee({
  releases,
  artists,
}: {
  releases: Release[];
  artists: Artist[];
}) {
  if (releases.length === 0) return null;
  const artistNames = new Map(artists.map((artist) => [artist.id, artist.name]));

  return (
    <section aria-label="지금 주목받는 음반" className="overflow-hidden border-y border-line py-4">
      <div className="release-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div aria-hidden={copy === 1} className="flex shrink-0 gap-3 pr-3" key={copy}>
            {releases.map((release, index) => (
              <Link
                className="flex w-56 shrink-0 items-center gap-3 rounded-xl bg-surface/70 p-2 transition hover:bg-surface"
                href={`/products/${release.id}`}
                key={`${copy}-${release.id}`}
                tabIndex={copy === 1 ? -1 : undefined}
              >
                <div
                  className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${release.coverColor}`}
                >
                  {release.imageUrl && (
                    <Image
                      src={release.imageUrl}
                      alt={release.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">{release.title}</p>
                  <p className="mt-1 truncate text-[10px] text-muted">
                    {artistNames.get(release.artistId) ?? "MU:RATHON"}
                  </p>
                </div>
                <span className="ml-auto pr-1 font-mono text-[9px] text-ink/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
