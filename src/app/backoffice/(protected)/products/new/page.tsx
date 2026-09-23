import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  await requireAdmin();
  const [artists, albums] = await Promise.all([
    prisma.artist.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { type: "ALBUM" },
      select: { id: true, title: true, artist: { select: { name: true } } },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/products" className="text-sm font-semibold text-muted hover:text-ink">
        ← 상품
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-black text-ink">상품 추가</h1>
      <ProductForm
        action={createProductAction}
        artists={artists}
        albums={albums.map((a) => ({ id: a.id, title: a.title, artistName: a.artist.name }))}
        submitLabel="추가"
      />
    </div>
  );
}
