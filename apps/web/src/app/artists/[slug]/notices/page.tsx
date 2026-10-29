import { Image as ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pin } from "lucide-react";
import { getArtistBySlug } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { getArtistNoticeList } from "@/lib/artist-notices";
import { formatRelativeTime } from "@muraton/shared/format";

export default async function ArtistNoticesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const session = await getSession();
  const isOwner = Boolean(session?.user.artistMemberships.some((m) => m.artistId === artist.id));

  const notices = await getArtistNoticeList(artist.id, session?.user.id ?? null, isOwner);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold" style={{ color: "var(--artist-text)" }}>
        전체 공지
      </h1>

      {notices.length === 0 ? (
        <p className="text-sm opacity-70" style={{ color: "var(--artist-text)" }}>
          아직 공지가 없어요.
        </p>
      ) : (
        <ul
          className="divide-y overflow-hidden rounded-xl border"
          style={{
            borderColor: "color-mix(in srgb, var(--artist-text) 15%, transparent)",
            backgroundColor: "var(--artist-card)",
          }}
        >
          {notices.map((n) => (
            <li key={n.id}>
              <Link
                href={`/artists/${slug}/notices/${n.id}`}
                className="flex items-center gap-2 px-4 py-3 transition hover:opacity-80"
                style={{ color: "var(--artist-card-text)" }}
              >
                {n.pinned && <Pin size={13} className="shrink-0" style={{ color: "var(--artist-accent)" }} />}
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{n.title}</span>
                {n.hasImage && <ImageIcon aria-label="이미지 포함" className="size-3.5 shrink-0 opacity-60" />}
                <span className="shrink-0 text-xs opacity-60">{formatRelativeTime(n.sentAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
