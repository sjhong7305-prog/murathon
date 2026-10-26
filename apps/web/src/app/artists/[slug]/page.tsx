import { notFound } from "next/navigation";
import Link from "next/link";
import { getArtistBySlug, getProductsByArtist } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { getArtistFeedPage } from "@/lib/artist-feed";
import { getArtistNoticeBox } from "@/lib/artist-notices";
import { prisma } from "@muraton/db";
import { DEFAULT_THEME } from "@muraton/shared/artist-theme";
import { computeArtistThemeStyle } from "@/lib/artist-theme-vars";
import { ProductCard } from "@/components/product-card";
import { FeedCard } from "@/components/feed-card";
import { NoticeBox } from "@/components/notice-box";
import { formatDate } from "@muraton/shared/format";

export default async function ArtistHomeTab({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const session = await getSession();
  const isOwner = Boolean(session?.user.artistMemberships.some((m) => m.artistId === artist.id));
  const theme = artist.theme ?? DEFAULT_THEME;
  const { readableCardText } = computeArtistThemeStyle(theme);

  const [products, feedPage, upcomingTicket, noticeBox] = await Promise.all([
    getProductsByArtist(artist.id),
    getArtistFeedPage(artist.id, session?.user.id ?? null, isOwner, null, 3),
    prisma.product.findFirst({
      where: { artistId: artist.id, type: "TICKET", eventAt: { gte: new Date() } },
      orderBy: { eventAt: "asc" },
    }),
    getArtistNoticeBox(artist.id, 3),
  ]);

  const latestRelease = products.find((p) => p.type === "album" || p.type === "track");

  return (
    <div className="flex flex-col gap-10">
      {(noticeBox.length > 0 || isOwner) && (
        <NoticeBox artistId={artist.id} artistSlug={slug} isOwner={isOwner} initialNotices={noticeBox} />
      )}

      {latestRelease && (
        <section>
          <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--artist-text)" }}>
            최신 발매작
          </h2>
          <div className="max-w-xs">
            <ProductCard product={latestRelease} theme={{ card: theme.colors.card, text: readableCardText, accent: theme.colors.accent }} />
          </div>
        </section>
      )}

      {upcomingTicket && (
        <section>
          <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--artist-text)" }}>
            다가오는 공연
          </h2>
          <Link
            href={`/products/${upcomingTicket.id}`}
            className="block rounded-2xl border p-4 transition hover:opacity-90"
            style={{ borderColor: "color-mix(in srgb, var(--artist-text) 15%, transparent)", backgroundColor: "var(--artist-card)" }}
          >
            <p className="font-bold" style={{ color: "var(--artist-card-text)" }}>
              {upcomingTicket.eventName ?? upcomingTicket.title}
            </p>
            <p className="mt-1 text-sm opacity-75" style={{ color: "var(--artist-card-text)" }}>
              {upcomingTicket.eventAt && formatDate(upcomingTicket.eventAt.toISOString())}
              {upcomingTicket.venue ? ` · ${upcomingTicket.venue}` : ""}
            </p>
          </Link>
        </section>
      )}

      {feedPage.posts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "var(--artist-text)" }}>
              최근 피드
            </h2>
            <Link href={`/artists/${slug}/feed`} className="text-sm font-semibold" style={{ color: "var(--artist-accent)" }}>
              더 보기 →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {feedPage.posts.map((p) => (
              <FeedCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
