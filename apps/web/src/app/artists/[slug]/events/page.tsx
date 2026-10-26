import { notFound } from "next/navigation";
import Link from "next/link";
import { getArtistBySlug, getProductsByArtist } from "@/lib/data";
import { formatDate, formatWon } from "@muraton/shared/format";

export default async function ArtistEventsTab({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const products = await getProductsByArtist(artist.id);
  const tickets = products
    .filter((p) => p.type === "ticket")
    .sort((a, b) => new Date(a.eventAt ?? 0).getTime() - new Date(b.eventAt ?? 0).getTime());

  if (tickets.length === 0) {
    return <p className="py-16 text-center text-sm opacity-70" style={{ color: "var(--artist-text)" }}>예정된 공연이 없어요.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {tickets.map((t) => (
        <Link
          key={t.id}
          href={`/products/${t.id}`}
          className="flex items-center justify-between gap-3 rounded-2xl border p-4 transition hover:opacity-90"
          style={{ borderColor: "color-mix(in srgb, var(--artist-text) 15%, transparent)", backgroundColor: "var(--artist-card)" }}
        >
          <div className="min-w-0">
            <p className="font-bold" style={{ color: "var(--artist-card-text)" }}>
              {t.eventName ?? t.title}
            </p>
            <p className="mt-1 text-sm opacity-75" style={{ color: "var(--artist-card-text)" }}>
              {t.eventAt && formatDate(t.eventAt)}
              {t.venue ? ` · ${t.venue}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold" style={{ color: "var(--artist-accent)" }}>
            {formatWon(t.minPrice)}부터
          </span>
        </Link>
      ))}
    </div>
  );
}
