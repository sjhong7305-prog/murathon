import { notFound } from "next/navigation";
import { getArtistById, getProductById } from "@/lib/data";
import { ProductDetail } from "@/components/product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const artist = await getArtistById(product.artistId);
  if (!artist) notFound();

  return <ProductDetail product={product} artist={artist} />;
}
