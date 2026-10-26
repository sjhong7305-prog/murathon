import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { AtSign, Globe, PlayCircle } from "lucide-react";
import type { Artist, ArtistMemberSummary, Product } from "@muraton/shared/types";
import { formatDate, formatWon } from "@muraton/shared/format";
import { formatReleaseLabel } from "@muraton/shared/release-label";
import { ArtistBio } from "./artist-bio";
import { FollowArtistButton } from "./follow-artist-button";
import { CoverArt } from "./cover-art";
import { SubscriptionCard } from "./subscription-card";

const CARD_BORDER = "color-mix(in srgb, var(--artist-text) 15%, transparent)";
const DIVIDER_BORDER = "color-mix(in srgb, var(--artist-text) 12%, transparent)";

const cardStyle = { borderColor: CARD_BORDER, backgroundColor: "var(--artist-card)" };

const EXTERNAL_LINK_ICONS: { key: "sns" | "youtube" | "website"; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { key: "sns", label: "SNS", Icon: AtSign },
  { key: "youtube", label: "YouTube", Icon: PlayCircle },
  { key: "website", label: "웹사이트", Icon: Globe },
];

function Avatar({ src, alt, size, fallbackColor }: { src?: string; alt: string; size: number; fallbackColor: string }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, backgroundColor: fallbackColor }}
    >
      {src && (
        <Image src={src} alt={alt} width={size} height={size} className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function ArtistInfoCard({
  artist,
  members,
  followerCount,
}: {
  artist: Artist;
  members: ArtistMemberSummary[];
  followerCount: number;
}) {
  const links = EXTERNAL_LINK_ICONS.flatMap(({ key, label, Icon }) => {
    const href = artist.externalLinks?.[key];
    return href ? [{ key, href, label, Icon }] : [];
  });

  return (
    <section className="rounded-2xl border p-5" style={cardStyle}>
      <div className="flex items-center gap-3">
        <Avatar src={artist.imageUrl} alt={artist.name} size={56} fallbackColor="var(--artist-accent)" />
        <div className="min-w-0">
          <p className="truncate font-bold" style={{ color: "var(--artist-card-text)" }}>
            {artist.name}
          </p>
          <p className="text-sm opacity-70" style={{ color: "var(--artist-card-text)" }}>
            {artist.genre}
          </p>
        </div>
      </div>

      {artist.introduction && (
        <div className="mt-4">
          <ArtistBio text={artist.introduction} />
        </div>
      )}

      {members.length > 1 && (
        <ul className="mt-4 flex flex-col gap-2.5 border-t pt-4" style={{ borderColor: DIVIDER_BORDER }}>
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2.5">
              <Avatar src={m.imageUrl} alt={m.name} size={32} fallbackColor="var(--artist-accent)" />
              <div className="min-w-0 text-sm">
                <span className="font-semibold" style={{ color: "var(--artist-card-text)" }}>
                  {m.name}
                </span>
                {m.roleLabel && (
                  <span className="ml-1.5 opacity-60" style={{ color: "var(--artist-card-text)" }}>
                    {m.roleLabel}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {links.length > 0 && (
        <div className="mt-4 flex gap-2">
          {links.map(({ key, href, label, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="flex h-8 w-8 items-center justify-center rounded-full border transition hover:opacity-80"
              style={{ borderColor: DIVIDER_BORDER, color: "var(--artist-card-text)" }}
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: DIVIDER_BORDER }}>
        <p className="text-sm opacity-70" style={{ color: "var(--artist-card-text)" }}>
          팔로워 {followerCount.toLocaleString("ko-KR")}명
        </p>
        <FollowArtistButton artistId={artist.id} />
      </div>
    </section>
  );
}

function LatestReleasesCard({ artistSlug, releases }: { artistSlug: string; releases: Product[] }) {
  if (releases.length === 0) return null;

  return (
    <section className="rounded-2xl border p-5" style={cardStyle}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold" style={{ color: "var(--artist-card-text)" }}>
          최신 발매작
        </h2>
        <Link
          href={`/artists/${artistSlug}/discography`}
          className="text-xs font-semibold hover:underline"
          style={{ color: "var(--artist-accent)" }}
        >
          전체 보기
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-5">
        {releases.map((r) => (
          <div key={r.id} className="flex flex-col gap-2.5">
            <CoverArt gradient={r.coverColor} label={r.title} type={r.type} imageUrl={r.imageUrl} hasSecret={Boolean(r.secretContent)} />
            <div>
              <p className="truncate text-sm font-bold" style={{ color: "var(--artist-card-text)" }}>
                {r.title}
              </p>
              {formatReleaseLabel(r) && (
                <p className="text-xs opacity-70" style={{ color: "var(--artist-card-text)" }}>
                  {formatReleaseLabel(r)}
                </p>
              )}
              <p className="mt-0.5 text-xs font-semibold" style={{ color: "var(--artist-accent)" }}>
                {r.minPrice === 0 ? `${formatWon(r.suggestedPrice)} · 자율 가격` : `${formatWon(r.minPrice)}부터`}
              </p>
            </div>
            <Link
              href={`/products/${r.id}`}
              className="rounded-full py-2 text-center text-xs font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--artist-accent)" }}
            >
              후원하고 듣기
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function UpcomingShowsCard({ shows }: { shows: Product[] }) {
  if (shows.length === 0) return null;

  return (
    <section className="rounded-2xl border p-5" style={cardStyle}>
      <h2 className="text-sm font-bold" style={{ color: "var(--artist-card-text)" }}>
        다가오는 공연
      </h2>
      <div className="mt-3 flex flex-col gap-3.5">
        {shows.map((s) => (
          <Link key={s.id} href={`/products/${s.id}`} className="block transition hover:opacity-80">
            <p className="text-xs opacity-70" style={{ color: "var(--artist-card-text)" }}>
              {formatDate(s.eventAt)}
              {s.venue ? ` · ${s.venue}` : ""}
            </p>
            <p className="mt-0.5 truncate text-sm font-bold" style={{ color: "var(--artist-card-text)" }}>
              {s.eventName ?? s.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Right sidebar for /artists/[slug] (all tabs). Blocks 1 & 2 always render when they have data;
 * blocks 3 & 4 are wrapped in a `hidden lg:flex` group so they only ever show at desktop widths —
 * below the 1024px breakpoint the sidebar (already reordered after the main content in the parent
 * layout's DOM) surfaces only the artist-info and latest-releases cards, per spec.
 */
export function ArtistSidebar({
  artist,
  members,
  followerCount,
  latestReleases,
  upcomingShows,
}: {
  artist: Artist;
  members: ArtistMemberSummary[];
  followerCount: number;
  latestReleases: Product[];
  upcomingShows: Product[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <ArtistInfoCard artist={artist} members={members} followerCount={followerCount} />
      <LatestReleasesCard artistSlug={artist.slug} releases={latestReleases} />

      <div className="hidden flex-col gap-6 lg:flex">
        <UpcomingShowsCard shows={upcomingShows} />
        {artist.membershipEnabled && (
          <SubscriptionCard
            variant="compact"
            artistId={artist.id}
            artistName={artist.name}
            monthlyPrice={artist.subscriptionPriceMonthly}
            yearlyPrice={artist.subscriptionPriceYearly}
            benefits={artist.subscriptionBenefits}
          />
        )}
      </div>
    </div>
  );
}
