import Link from "next/link";
import {
  getAllArtists,
  getAllProducts,
  getDigCandidates,
  getFeaturedReleases,
  getLastWeekPopularAlbums,
  getLatestReleasesByArtist,
  getRecentFanVoices,
  getRecentSupports,
} from "@/lib/data";
import { GENRES } from "@/lib/genres";
import type { Artist, Product } from "@muraton/shared/types";
import type { HomeTrack } from "@/lib/home-types";
import { ProductCard } from "@/components/product-card";
import { NewArtistCard } from "@/components/new-artist-card";
import { HeroBanner } from "@/components/hero-banner";
import { LiveSupportTicker } from "@/components/live-support-ticker";
import { DigMix } from "@/components/dig-mix";
import { FanVoices } from "@/components/fan-voices";
import { SectionHeader } from "@/components/section-header";

// Home previously had no revalidate/dynamic config, so `next build` baked it into a static
// shell that only ever updated on redeploy — new artists/releases never showed up live.
export const revalidate = 30;

/** Product → HomeTrack using the already-loaded artist list (ticker fallback items). */
function releaseToHomeTrack(product: Product, artists: Artist[]): HomeTrack[] {
  const artist = artists.find((a) => a.id === product.artistId);
  if (!artist) return [];
  return [
    {
      productId: product.id,
      title: product.title,
      artistId: artist.id,
      artistName: artist.name,
      artistSlug: artist.slug,
      coverColor: product.coverColor,
      imageUrl: product.imageUrl,
      playable: Boolean(product.previewAudioUrl),
    },
  ];
}

async function loadHomeData() {
  // Relative times ("3분 전") in the ticker are computed from this, so SSR and hydration agree.
  const loadedAt = Date.now();
  // Discovery sections are optional: if one query fails, that section hides instead of the page erroring.
  const [artists, products, featuredReleases, lastWeekPopularAlbums, supports, digCandidates, fanVoices] =
    await Promise.all([
      getAllArtists(),
      getAllProducts(),
      getFeaturedReleases(8),
      getLastWeekPopularAlbums(6).catch(() => []),
      getRecentSupports(20).catch(() => []),
      getDigCandidates(24).catch(() => []),
      getRecentFanVoices(9).catch(() => []),
    ]);
  return { loadedAt, artists, products, featuredReleases, lastWeekPopularAlbums, supports, digCandidates, fanVoices };
}

export default async function Home() {
  const { loadedAt, artists, products, featuredReleases, lastWeekPopularAlbums, supports, digCandidates, fanVoices } =
    await loadHomeData();
  const upcomingShows = products.filter((p) => p.type === "ticket");
  // getAllArtists returns oldest-first, so reversing gives the most recently joined artists.
  const newArtists = [...artists].reverse().slice(0, 8);
  const newArtistsWithTracks = await Promise.all(
    newArtists.map(async (artist) => {
      const [track] = await getLatestReleasesByArtist(artist.id, 1);
      return { artist, track };
    })
  );
  const tickerReleases = featuredReleases.flatMap((product) => releaseToHomeTrack(product, artists));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="hero-theme">
        <HeroBanner />
      </div>

      <LiveSupportTicker initialSupports={supports} releases={tickerReleases} serverNow={loadedAt} />

      <section className="mt-16 sm:mt-20">
        <SectionHeader title="New Artists" subtitle="첫 번째 팬이 되어보세요" href="/artists" />
        {newArtistsWithTracks.length > 0 ? (
          <ul className="scrollbar-hide -mx-3 -mt-1 flex snap-x snap-mandatory overflow-x-auto">
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

      <DigMix candidates={digCandidates} />

      <section className="mt-20 sm:mt-24">
        <SectionHeader title="Popular Last Week" subtitle="저번주 가장 많이 응원받은 앨범" />
        {lastWeekPopularAlbums.length > 0 ? (
          <div className="-mx-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {lastWeekPopularAlbums.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            지난주에 주문된 앨범이 아직 없어요. 이번 주 첫 번째 팬이 되어보세요!
          </p>
        )}
      </section>

      {fanVoices.length >= 3 && (
        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Follower Voices" subtitle="이 음악에 값을 매긴 팔로워들의 한마디" />
          <FanVoices voices={fanVoices} />
        </section>
      )}

      {upcomingShows.length > 0 && (
        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Upcoming Shows" subtitle="직접 만나서 응원하세요" />
          <div className="-mx-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {upcomingShows.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 rounded-3xl bg-surface p-6 sm:mt-20 sm:p-10">
        <SectionHeader title="Find by Genre" subtitle="좋아하는 장르에서 시작하기" />
        <div className="mt-1 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link
              key={g.slug}
              href={`/artists?genre=${g.slug}`}
              className="inline-flex min-h-10 items-center rounded-full bg-tone px-4 text-sm font-semibold text-ink transition-colors hover:bg-lime"
            >
              {g.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
