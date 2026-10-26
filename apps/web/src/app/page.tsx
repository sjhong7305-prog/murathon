import Link from "next/link";
import { getAllArtists, getAllProducts, getFeaturedReleases, getLatestReleasesByArtist } from "@/lib/data";
import { GENRES } from "@/lib/genres";
import { ArtistCard } from "@/components/artist-card";
import { ProductCard } from "@/components/product-card";
import { TrendingArtistRow } from "@/components/trending-artist-row";
import { HeroBanner } from "@/components/hero-banner";
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
  const trending = [...artists]
    .sort((a, b) => (b.supporters?.length ?? 0) - (a.supporters?.length ?? 0))
    .slice(0, 8);
  const trendingWithTracks = await Promise.all(
    trending.map(async (artist) => {
      const [track] = await getLatestReleasesByArtist(artist.id, 1);
      return { artist, track };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="hero-theme">
        <HeroBanner />
      </div>

      <section className="mb-14">
        <h2 className="mb-4 text-lg font-bold text-ink">요즘 뜨는 아티스트</h2>
        {trendingWithTracks.length > 0 ? (
          <div className="mx-auto max-w-[880px]">
            {trendingWithTracks.map(({ artist, track }, i) => (
              <TrendingArtistRow key={artist.id} index={i + 1} artist={artist} track={track} />
            ))}
            <div className="mt-3 text-right">
              <Link
                href="/artists"
                className="text-sm font-semibold text-muted transition hover:text-accent-strong"
              >
                더 보기
              </Link>
            </div>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            아직 뜨는 아티스트가 없어요. 곧 새로운 아티스트가 합류할 예정이에요!
          </p>
        )}
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-lg font-bold text-ink">지금 인기 있는 발매작</h2>
        {featuredReleases.length > 0 ? (
          <ReleaseMarquee products={featuredReleases} />
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
