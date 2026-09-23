import Link from "next/link";
import { getAllArtists } from "@/lib/data";
import { GENRES } from "@/lib/genres";
import { CoverArt } from "@/components/cover-art";

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre } = await searchParams;
  const activeGenre = genre && GENRES.some((g) => g.slug === genre) ? genre : "all";

  const artists = await getAllArtists();
  const filteredArtists =
    activeGenre === "all"
      ? artists
      : artists.filter((artist) => artist.genreTags?.includes(activeGenre));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-black text-ink">아티스트</h1>
      <p className="mt-1 text-sm text-muted">
        무레이톤과 함께하는 인디 아티스트들을 소개합니다.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/artists"
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
            activeGenre === "all"
              ? "border-accent bg-accent text-white"
              : "border-line text-muted hover:border-black/20 hover:text-ink"
          }`}
        >
          전체
        </Link>
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/artists?genre=${g.slug}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              activeGenre === g.slug
                ? "border-accent bg-accent text-white"
                : "border-line text-muted hover:border-black/20 hover:text-ink"
            }`}
          >
            {g.label}
          </Link>
        ))}
      </div>

      {filteredArtists.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted">
          아직 이 장르의 아티스트가 없어요. 곧 새로운 아티스트가 합류할 예정이에요!
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.slug}`}
              className="group flex gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:shadow-md"
            >
              <div className="w-24 shrink-0">
                <CoverArt
                  gradient={artist.coverColor}
                  label={artist.name}
                  imageUrl={artist.imageUrl}
                  rounded="rounded-xl"
                  hideLabel
                  sizes="96px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-accent-strong">
                  {artist.genre} · {artist.location}
                </p>
                <h2 className="mt-0.5 truncate font-bold text-ink group-hover:underline">
                  {artist.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{artist.tagline}</p>
                {artist.supporters && artist.supporters.length > 0 && (
                  <p className="mt-2 text-xs text-muted">
                    🏆 서포터 {artist.supporters.length}명
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
