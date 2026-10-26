import { requireArtistMember } from "@/lib/auth";
import { getArtistById, getProductsByArtist } from "@/lib/data";
import { getArtistFeedPage } from "@/lib/artist-feed";
import { prisma } from "@muraton/db";
import { DEFAULT_THEME } from "@muraton/shared/artist-theme";
import { ArtistProfileForm } from "./artist-profile-form";
import { AppearanceEditor } from "./appearance-editor";

export default async function DashboardSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist: membershipArtist, user, membership } = await requireArtistMember(slug);
  const artist = await getArtistById(membershipArtist.id);
  if (!artist) return null;

  const [products, initialFeed, followerCount] = await Promise.all([
    getProductsByArtist(artist.id, { includeUnpublished: true }),
    getArtistFeedPage(artist.id, user.id, true),
    prisma.follow.count({ where: { artistId: artist.id } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-2xl">
        <h1 className="text-2xl font-black text-ink">페이지 설정</h1>
        <p className="mt-1 mb-6 text-sm text-muted">기본 정보</p>
        <ArtistProfileForm artist={artist} />
      </section>

      <div className="border-t border-line" />

      <section>
        <AppearanceEditor
          artist={artist}
          initialTheme={artist.theme ?? DEFAULT_THEME}
          products={products}
          initialFeed={initialFeed}
          followerCount={followerCount}
          memberProfile={{
            id: membership.id,
            displayName: membership.displayName,
            imageUrl: membership.imageUrl,
            roleLabel: membership.roleLabel,
          }}
        />
      </section>
    </div>
  );
}
