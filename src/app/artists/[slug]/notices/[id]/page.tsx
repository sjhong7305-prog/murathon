import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pin, Lock } from "lucide-react";
import { getArtistBySlug } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { getNoticeById } from "@/lib/artist-notices";
import { FeedMediaGrid } from "@/components/feed-media-grid";
import { formatDateTime } from "@/lib/format";

const VISIBILITY_LABEL: Record<string, string> = {
  PUBLIC: "전체 공개",
  SUPPORTER: "구매자 전용",
  SUBSCRIBER: "구독자 전용",
};

export default async function ArtistNoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const session = await getSession();
  const isOwner = Boolean(session?.user.artistMemberships.some((m) => m.artistId === artist.id));

  // getNoticeById already folds "doesn't exist" and "not eligible" into the same null — never
  // leaks which one it was to an ineligible viewer.
  const notice = await getNoticeById(artist.id, id, session?.user.id ?? null, isOwner);
  if (!notice) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/artists/${slug}/notices`} className="flex items-center gap-1 text-sm font-semibold opacity-70" style={{ color: "var(--artist-text)" }}>
        <ChevronLeft size={16} /> 전체 공지로
      </Link>

      <article
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "color-mix(in srgb, var(--artist-text) 15%, transparent)", backgroundColor: "var(--artist-card)" }}
      >
        <div className="flex flex-col gap-2 border-b px-5 py-4" style={{ borderColor: "color-mix(in srgb, var(--artist-text) 10%, transparent)" }}>
          <div className="flex flex-wrap items-center gap-2">
            {notice.pinned && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--artist-accent) 15%, transparent)", color: "var(--artist-accent)" }}>
                <Pin size={10} /> 고정됨
              </span>
            )}
            {notice.visibility !== "PUBLIC" && (
              <span className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold" style={{ color: "var(--artist-card-text)" }}>
                <Lock size={9} /> {VISIBILITY_LABEL[notice.visibility]}
              </span>
            )}
            <span className="text-xs opacity-60" style={{ color: "var(--artist-card-text)" }}>
              {formatDateTime(notice.sentAt)}
            </span>
          </div>
          <h1 className="text-xl font-black" style={{ color: "var(--artist-card-text)" }}>
            {notice.title}
          </h1>
        </div>

        {notice.media.length > 0 && (
          <FeedMediaGrid
            media={notice.media.map((m) => ({
              id: m.id,
              type: "IMAGE" as const,
              url: m.url,
              width: m.width,
              height: m.height,
              durationSec: null,
              position: m.position,
            }))}
          />
        )}

        <p className="whitespace-pre-wrap px-5 py-4 text-sm leading-relaxed" style={{ color: "var(--artist-card-text)" }}>
          {notice.message}
        </p>
      </article>
    </div>
  );
}
