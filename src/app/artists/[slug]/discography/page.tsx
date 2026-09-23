import { notFound } from "next/navigation";
import { getArtistBySlug, getProductsByArtist } from "@/lib/data";
import { DEFAULT_THEME } from "@/lib/artist-theme";
import { computeArtistThemeStyle } from "@/lib/artist-theme-vars";
import { ProductCard } from "@/components/product-card";

export default async function ArtistDiscographyTab({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const theme = artist.theme ?? DEFAULT_THEME;
  const { readableCardText } = computeArtistThemeStyle(theme);
  const products = await getProductsByArtist(artist.id);

  if (products.length === 0) {
    return <p className="py-16 text-center text-sm opacity-70" style={{ color: "var(--artist-text)" }}>아직 등록된 상품이 없어요.</p>;
  }

  return (
    <div
      className={
        theme.discographyLayout === "list"
          ? "flex flex-col gap-2"
          : "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          layout={theme.discographyLayout}
          theme={{ card: theme.colors.card, text: readableCardText, accent: theme.colors.accent }}
        />
      ))}
    </div>
  );
}
