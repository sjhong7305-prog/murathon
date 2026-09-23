import { notFound } from "next/navigation";
import { getArtistBySlug } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { getArtistFeedPage } from "@/lib/artist-feed";
import { prisma } from "@/lib/prisma";
import { ArtistFeedTabContent } from "@/components/artist-feed-tab-content";

export default async function ArtistFeedTab({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const session = await getSession();
  const membership = session?.user.artistMemberships.find((m) => m.artistId === artist.id);
  const isOwner = Boolean(membership);

  const [initialFeed, memberRows] = await Promise.all([
    getArtistFeedPage(artist.id, session?.user.id ?? null, isOwner),
    prisma.artistMember.findMany({ where: { artistId: artist.id }, select: { id: true, displayName: true, imageUrl: true } }),
  ]);

  const members = memberRows.map((m) => ({
    id: m.id,
    name: m.displayName ?? artist.name,
    imageUrl: m.imageUrl ?? artist.imageUrl ?? null,
  }));

  const ownerAvatarUrl = membership
    ? (memberRows.find((m) => m.id === membership.id)?.imageUrl ?? artist.imageUrl ?? null)
    : null;

  return (
    <ArtistFeedTabContent
      artistId={artist.id}
      members={members}
      initialFeed={initialFeed}
      isOwner={isOwner}
      ownerAvatarUrl={ownerAvatarUrl}
    />
  );
}
