import Link from "next/link";
import { getProductsByArtist } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { CoverArt } from "@/components/cover-art";
import { requireArtistMember } from "@/lib/auth";
import { DeleteReleaseButton } from "@/components/delete-release-button";

export default async function ReleasesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist } = await requireArtistMember(slug);
  const releases = await getProductsByArtist(artist.id, { includeUnpublished: true });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink">릴리즈 관리</h1>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/artist/${artist.slug}/dashboard/upload/track`}
            className="rounded-full border border-accent/40 px-5 py-2.5 text-sm font-bold text-accent-strong transition hover:bg-accent/10"
          >
            🎵 음원 업로드
          </Link>
          <Link
            href={`/artist/${artist.slug}/dashboard/upload`}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            + 새 릴리즈 업로드
          </Link>
        </div>
      </div>

      <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {releases.map((product) => (
          <div key={product.id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-10 shrink-0">
              <CoverArt
                gradient={product.coverColor}
                label=""
                imageUrl={product.imageUrl}
                sizes="40px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">
                {product.title}
                {product.status === "unpublished" && (
                  <span className="ml-1.5 rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-muted">
                    비공개
                  </span>
                )}
              </p>
              <p className="text-xs text-muted">{product.format}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-ink">
              {formatWon(product.suggestedPrice)}
            </span>
            <Link
              href={`/artist/${artist.slug}/dashboard/upload`}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-black/20 hover:text-ink"
            >
              수정
            </Link>
            {(product.type === "album" || product.type === "track") &&
              product.status === "published" && (
                <DeleteReleaseButton
                  artistId={artist.id}
                  productId={product.id}
                  title={product.title}
                />
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
