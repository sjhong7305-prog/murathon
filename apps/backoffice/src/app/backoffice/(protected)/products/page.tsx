import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { formatWon } from "@muraton/shared/format";

const TYPE_LABEL: Record<string, string> = {
  ALBUM: "앨범",
  TRACK: "트랙",
  MERCH: "굿즈",
  TICKET: "티켓",
};

export default async function BackofficeProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    include: { artist: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">상품</h1>
        <Link
          href="/backoffice/products/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          + 상품 추가
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/backoffice/products/${product.id}/edit`}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">{product.title}</p>
              <p className="text-sm text-muted">
                {product.artist.name} · {TYPE_LABEL[product.type]}
              </p>
            </div>
            <span className="shrink-0 text-sm text-ink">{formatWon(product.suggestedPrice)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
