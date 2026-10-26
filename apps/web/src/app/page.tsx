import Link from "next/link";
import { getAllArtists, getAllProducts, getFeaturedReleases, getLatestReleasesByArtist } from "@/lib/data";
import { GENRES } from "@/lib/genres";
import { ArtistCard } from "@/components/artist-card";
import { ProductCard } from "@/components/product-card";
import { NewArtistCard } from "@/components/new-artist-card";
import { HeroBanner } from "@/components/hero-banner";
import { ProductCardMarquee } from "@/components/product-card-marquee";
import { ReleaseMarquee } from "@/components/release-marquee";

// Home previously had no revalidate/dynamic config, so `next build` baked it into a static
// shell that only ever updated on redeploy — new artists/releases never showed up live.
export const revalidate = 30;

export default async function Home() {
  const [artists, products, featuredReleases] = await Promise.all([
    getAllArtists(),
    getAllProducts(),
    getFeaturedReleases(8),
  ]);
  const upcomingShows = products.filter((p) => p.type === "ticket");
  // getAllArtists returns oldest-first, so reversing gives the most recently joined artists.
  const newArtists = [...artists].reverse().slice(0, 8);
  const newArtistsWithTracks = await Promise.all(
    newArtists.map(async (artist) => {
      const [track] = await getLatestReleasesByArtist(artist.id, 1);
      return { artist, track };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="hero-theme">
        <HeroBanner />
      </div>
      <div className="release-marquee-theme">
        <ReleaseMarquee releases={featuredReleases} artists={artists} />
      </div>

      <section className="mt-12 mb-14 sm:mt-16">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-ink">New Artists</h2>
            <p className="mt-1 text-sm text-muted">첫 번째 팬이 되어보세요</p>
          </div>
          <Link
            href="/artists"
            className="shrink-0 text-sm font-bold text-muted transition hover:text-ink hover:underline"
          >
            모두 보기
          </Link>
        </div>
        {newArtistsWithTracks.length > 0 ? (
          <ul className="scrollbar-hide -mx-3 flex snap-x snap-mandatory overflow-x-auto">
            {newArtistsWithTracks.map(({ artist, track }) => (
              <li
                key={artist.id}
                className="w-[34%] shrink-0 snap-start sm:w-[20%] md:w-[16.666%] lg:w-[12.5%]"
              >
                <NewArtistCard artist={artist} track={track} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            아직 등록된 아티스트가 없어요. 곧 새로운 아티스트를 만나보실 수 있어요!
          </p>
        )}
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-lg font-bold text-ink">지금 인기 있는 발매작</h2>
        {featuredReleases.length > 0 ? (
          <ProductCardMarquee products={featuredReleases} />
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            아직 발매된 작품이 없어요. 첫 발매를 가장 먼저 만나보세요!
          </p>
        )}
      </section>

      {upcomingShows.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-1 text-lg font-bold text-ink">🎤 다가오는 공연</h2>
          <p className="mb-4 text-sm text-muted">
            직접 만나서 응원할 수 있는 라이브 공연을 확인해보세요.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {upcomingShows.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section id="artists" className="scroll-mt-20 mb-14">
        <h2 className="mb-4 text-lg font-bold text-ink">아티스트</h2>
        {artists.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            아직 합류한 아티스트가 없어요. 곧 새로운 아티스트가 합류할 예정이에요!
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-bold text-ink">장르로 아티스트 찾기</h2>
        <p className="mt-1 text-sm text-muted">
          좋아하는 장르를 골라 새로운 아티스트를 발견해보세요.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link
              key={g.slug}
              href={`/artists?genre=${g.slug}`}
              className="rounded-full border border-line bg-cream px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent/50 hover:bg-accent/10 hover:text-accent-strong"
            >
              {g.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
