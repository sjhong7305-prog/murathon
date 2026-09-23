import Link from "next/link";
import { getAllArtists, getAllProducts } from "@/lib/data";
import { GENRES } from "@/lib/genres";
import { ArtistCard } from "@/components/artist-card";
import { ProductCard } from "@/components/product-card";
import { TrendingArtistCard } from "@/components/trending-artist-card";
import { HeroBanner } from "@/components/hero-banner";

export default async function Home() {
  const [artists, products] = await Promise.all([getAllArtists(), getAllProducts()]);
  const featuredAlbums = products.filter((p) => p.type === "album").slice(0, 8);
  const upcomingShows = products.filter((p) => p.type === "ticket");
  const trending = [...artists]
    .sort((a, b) => (b.supporters?.length ?? 0) - (a.supporters?.length ?? 0))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <HeroBanner />

      <section className="mb-14">
        <h2 className="mb-1 text-lg font-bold text-ink">🔥 요즘 뜨는 아티스트</h2>
        <p className="mb-4 text-sm text-muted">
          지금 팬들의 후원이 몰리고 있는 아티스트를 만나보세요.
        </p>
        <div className="flex gap-4 overflow-x-auto px-1 pb-3 pt-6">
          {trending.map((artist) => (
            <TrendingArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-lg font-bold text-ink">지금 인기 있는 발매작</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {featuredAlbums.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
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
