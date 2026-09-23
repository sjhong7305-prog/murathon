import { notFound } from "next/navigation";
import Link from "next/link";
import { Palette, PenSquare, LayoutDashboard } from "lucide-react";
import { getArtistBySlug, getArtistMembers, getLatestReleasesByArtist, getUpcomingShowsByArtist } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_THEME } from "@/lib/artist-theme";
import { computeArtistThemeStyle } from "@/lib/artist-theme-vars";
import { ArtistBanner } from "@/components/artist-banner";
import { ArtistTabBar } from "@/components/artist-tab-bar";
import { ArtistSidebar } from "@/components/artist-sidebar";

export default async function ArtistLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const [session, followerCount, members, latestReleases, upcomingShows] = await Promise.all([
    getSession(),
    prisma.follow.count({ where: { artistId: artist.id } }),
    getArtistMembers(artist.id),
    getLatestReleasesByArtist(artist.id, 2),
    getUpcomingShowsByArtist(artist.id, 3),
  ]);
  const isOwner = Boolean(session?.user.artistMemberships.some((m) => m.artistId === artist.id));
  const theme = artist.theme ?? DEFAULT_THEME;
  const { vars, backgroundStyle, fontClassName } = computeArtistThemeStyle(theme);

  return (
    <div style={{ ...vars, ...backgroundStyle }} className={`min-h-screen w-full ${fontClassName}`}>
      {isOwner && (
        <div className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-4 py-2.5 text-sm">
            <span className="font-bold text-ink">내 아티스트 페이지입니다</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <Link
                href={`/artist/${artist.slug}/dashboard/settings`}
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-accent/50"
              >
                <Palette size={13} /> 페이지 꾸미기
              </Link>
              <Link
                href={`/artists/${artist.slug}/feed`}
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-accent/50"
              >
                <PenSquare size={13} /> 피드 작성
              </Link>
              <Link
                href={`/artist/${artist.slug}/dashboard`}
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-accent/50"
              >
                <LayoutDashboard size={13} /> 대시보드
              </Link>
            </div>
          </div>
        </div>
      )}

      <ArtistBanner artist={artist} theme={theme} followerCount={followerCount} />
      <ArtistTabBar slug={artist.slug} />

      <div className="mx-auto max-w-[1200px] px-4 py-8 lg:grid lg:grid-cols-[minmax(640px,1fr)_360px] lg:items-start lg:gap-6">
        <div style={{ color: "var(--artist-text)" }} className="min-w-0">
          {children}
        </div>
        <aside className="mt-8 w-full lg:mt-0 lg:sticky lg:top-[170px] lg:w-[360px]">
          <ArtistSidebar
            artist={artist}
            members={members}
            followerCount={followerCount}
            latestReleases={latestReleases}
            upcomingShows={upcomingShows}
          />
        </aside>
      </div>
    </div>
  );
}
