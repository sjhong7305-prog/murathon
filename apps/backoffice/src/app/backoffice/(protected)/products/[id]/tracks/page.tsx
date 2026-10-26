import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { TrackRowsEditor } from "./track-rows-editor";
import { saveTracksAction } from "./actions";

export default async function ProductTracksPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [product, tracks] = await Promise.all([
    prisma.product.findUnique({ where: { id }, select: { id: true, title: true, type: true } }),
    prisma.albumTrack.findMany({ where: { productId: id }, orderBy: { trackNumber: "asc" } }),
  ]);
  if (!product || product.type !== "ALBUM") notFound();

  const action = saveTracksAction.bind(null, product.id);

  return (
    <div className="max-w-3xl">
      <Link
        href={`/backoffice/products/${product.id}/edit`}
        className="text-sm font-semibold text-muted hover:text-ink"
      >
        ← {product.title} 수정으로
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-black text-ink">{product.title} — 수록곡 관리</h1>

      <form action={action} className="flex flex-col gap-4">
        <TrackRowsEditor
          initialTracks={tracks.map((t) => ({
            trackNumber: t.trackNumber,
            title: t.title,
            durationSec: t.durationSec,
            previewUrl: t.previewUrl,
            isTitle: t.isTitle,
          }))}
        />
        <button
          type="submit"
          className="mt-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          저장
        </button>
      </form>
    </div>
  );
}
