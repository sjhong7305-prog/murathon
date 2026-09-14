import { notFound } from "next/navigation";
import { getArtistById, getProductById, products } from "@/lib/data";
import { ProductDetail } from "@/components/product-detail";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const artist = getArtistById(product.artistId);
  if (!artist) notFound();

  return <ProductDetail product={product} artist={artist} />;
}
