import { getAllArtists, getAllProducts, getMusicCatalog } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ArtistCard } from "@/components/artist-card";
import { MusicBrowser } from "@/components/music-browser";
import { formatReleaseLabel } from "@muraton/shared/release-label";
import type { ProductType } from "@muraton/shared/types";

const TYPE_GROUPS: Record<string, ProductType[]> = {
  music: ["album", "track"],
  merch: ["merch"],
  ticket: ["ticket"],
};

const TYPE_LABEL: Record<string, string> = {
  music: "음원",
  merch: "굿즈",
  ticket: "티켓",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const activeType = type && TYPE_GROUPS[type] ? type : undefined;
  const allowedTypes = activeType ? TYPE_GROUPS[activeType] : undefined;

  // The music page is its own browse experience: music-only search + inline album accordions.
  if (activeType === "music") {
    const [artists, releases] = await Promise.all([getAllArtists(), getMusicCatalog()]);
    return (
      <MusicBrowser
        releases={releases}
        artists={artists.map(({ id, name, slug }) => ({ id, name, slug }))}
        initialQuery={q ?? ""}
      />
    );
  }

  const [artists, products] = await Promise.all([getAllArtists(), getAllProducts()]);

  const matchedArtists =
    query && !activeType
      ? artists.filter(
          (a) => a.name.toLowerCase().includes(query) || a.genre.toLowerCase().includes(query)
        )
      : [];

  const matchedProducts = products.filter((p) => {
    if (allowedTypes && !allowedTypes.includes(p.type)) return false;
    if (!query) return true;
    const artist = artists.find((a) => a.id === p.artistId);
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      formatReleaseLabel(p).toLowerCase().includes(query) ||
      Boolean(artist?.name.toLowerCase().includes(query))
    );
  });

  const heading = activeType
    ? TYPE_LABEL[activeType]
    : query
      ? `“${q}” 검색 결과`
      : "전체 둘러보기";

  const hasResults = matchedArtists.length > 0 || matchedProducts.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-black text-ink">{heading}</h1>
      {query && (
        <p className="mt-1 text-sm text-muted">
          아티스트 {matchedArtists.length}개 · 상품 {matchedProducts.length}개
        </p>
      )}

      {!hasResults && (
        <p className="mt-8 text-sm text-muted">
          검색 결과가 없어요. 다른 키워드로 시도해보세요.
        </p>
      )}

      {matchedArtists.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-ink">아티스트</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {matchedArtists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </section>
      )}

      {matchedProducts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-ink">음원 · 굿즈 · 티켓</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {matchedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
