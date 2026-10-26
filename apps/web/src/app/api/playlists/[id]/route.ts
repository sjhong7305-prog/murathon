import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPlaylistForViewer, updatePlaylist, deletePlaylist } from "@/lib/playlists";

function serialize(playlist: NonNullable<Awaited<ReturnType<typeof getPlaylistForViewer>>>, viewerUserId: string | null) {
  return {
    id: playlist.id,
    title: playlist.title,
    description: playlist.description,
    coverUrl: playlist.coverUrl,
    isPublic: playlist.isPublic,
    isOwner: playlist.ownerUserId === viewerUserId,
    owner: { id: playlist.owner.id, nickname: playlist.owner.nickname },
    updatedAt: playlist.updatedAt,
    tracks: playlist.tracks.map((t) => ({
      productId: t.productId,
      position: t.position,
      title: t.product.title,
      type: t.product.type,
      coverColor: t.product.coverColor,
      imageUrl: t.product.imageUrl,
      artistId: t.product.artistId,
      artistName: t.product.artist.name,
      artistSlug: t.product.artist.slug,
    })),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const playlist = await getPlaylistForViewer(id, session?.user.id ?? null);
  if (!playlist) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(playlist, session?.user.id ?? null));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const result = await updatePlaylist(id, session.user.id, {
    title: body.title !== undefined ? String(body.title) : undefined,
    description: body.description !== undefined ? String(body.description) : undefined,
    coverUrl: body.coverUrl !== undefined ? String(body.coverUrl) : undefined,
    isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const result = await deletePlaylist(id, session.user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
