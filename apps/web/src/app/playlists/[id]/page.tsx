import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPlaylistForViewer } from "@/lib/playlists";
import { PlaylistDetail } from "./playlist-detail";

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const playlist = await getPlaylistForViewer(id, session?.user.id ?? null);
  if (!playlist) notFound();

  const isOwner = playlist.ownerUserId === session?.user.id;

  return (
    <PlaylistDetail
      playlist={{
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        isPublic: playlist.isPublic,
        isOwner,
        ownerNickname: playlist.owner.nickname,
        tracks: playlist.tracks.map((t) => ({
          productId: t.productId,
          title: t.product.title,
          type: t.product.type,
          coverColor: t.product.coverColor,
          imageUrl: t.product.imageUrl,
          artistName: t.product.artist.name,
          artistSlug: t.product.artist.slug,
        })),
      }}
    />
  );
}
