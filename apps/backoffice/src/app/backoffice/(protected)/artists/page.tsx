import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";

export default async function BackofficeArtistsPage() {
  await requireAdmin();

  const artists = await prisma.artist.findMany({
    include: { _count: { select: { products: true, tracks: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">아티스트</h1>
        <p className="text-xs text-muted">
          아티스트는 직접 가입해서 활동해요 — 백오피스에서는 만들 수 없어요.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {artists.map((artist) => (
          <Link
            key={artist.id}
            href={`/backoffice/artists/${artist.id}/edit`}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">{artist.name}</p>
              <p className="text-sm text-muted">
                {artist.genre} · {artist.location} · /{artist.slug}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted">
              상품 {artist._count.products} · 트랙 {artist._count.tracks}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
