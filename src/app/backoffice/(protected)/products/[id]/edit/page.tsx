import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../product-form";
import { updateProductAction } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [product, artists, albums] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.artist.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { type: "ALBUM", id: { not: id } },
      select: { id: true, title: true, artist: { select: { name: true } } },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, product.id);

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/products" className="text-sm font-semibold text-muted hover:text-ink">
        ← 상품
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-black text-ink">{product.title} 수정</h1>
      <ProductForm
        action={action}
        artists={artists}
        albums={albums.map((a) => ({ id: a.id, title: a.title, artistName: a.artist.name }))}
        submitLabel="저장"
        defaultValues={{
          artistId: product.artistId,
          type: product.type,
          title: product.title,
          description: product.description,
          format: product.format,
          releaseType: product.releaseType?.toLowerCase() ?? "single",
          minPrice: product.minPrice,
          suggestedPrice: product.suggestedPrice,
          coverColor: product.coverColor,
          imageUrl: product.imageUrl,
          previewAudioUrl: product.previewAudioUrl,
          secretTitle: product.secretTitle,
          secretMessage: product.secretMessage,
          eventName: product.eventName,
          venue: product.venue,
          eventAt: product.eventAt?.toISOString() ?? null,
          includedAlbumId: product.includedAlbumId,
          longDescription: product.longDescription,
          releaseDate: product.releaseDate?.toISOString() ?? null,
          credits: product.credits,
          durationSec: product.durationSec,
        }}
      />

      {product.type === "ALBUM" && (
        <div className="mt-8">
          <Link
            href={`/backoffice/products/${product.id}/tracks`}
            className="inline-block rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/20"
          >
            🎵 수록곡 관리
          </Link>
        </div>
      )}
    </div>
  );
}
