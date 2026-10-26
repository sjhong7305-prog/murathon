import { prisma } from "@muraton/db";
import { PLAYLIST_TITLE_MAX_LENGTH, PLAYLIST_TRACK_MAX_COUNT } from "@/lib/playlist-constants";

export type PlaylistResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > PLAYLIST_TITLE_MAX_LENGTH) {
    return `플레이리스트 제목은 1~${PLAYLIST_TITLE_MAX_LENGTH}자여야 해요.`;
  }
  return null;
}

export async function listMyPlaylists(ownerUserId: string) {
  const playlists = await prisma.playlist.findMany({
    where: { ownerUserId },
    include: { _count: { select: { tracks: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return playlists.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    coverUrl: p.coverUrl,
    isPublic: p.isPublic,
    trackCount: p._count.tracks,
    updatedAt: p.updatedAt,
  }));
}

/** For a profile's "플레이리스트" tab: the owner sees everything, anyone else sees only public ones. */
export async function listPlaylistsForProfile(ownerUserId: string, isOwner: boolean) {
  const playlists = await prisma.playlist.findMany({
    where: { ownerUserId, ...(isOwner ? {} : { isPublic: true }) },
    include: { _count: { select: { tracks: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return playlists.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    coverUrl: p.coverUrl,
    isPublic: p.isPublic,
    trackCount: p._count.tracks,
    updatedAt: p.updatedAt,
  }));
}

export async function createPlaylist(
  ownerUserId: string,
  input: { title: string; description?: string; coverUrl?: string; isPublic?: boolean }
): Promise<PlaylistResult<{ id: string }>> {
  const titleError = validateTitle(input.title);
  if (titleError) return { ok: false, error: titleError, status: 400 };

  const playlist = await prisma.playlist.create({
    data: {
      ownerUserId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      coverUrl: input.coverUrl?.trim() || null,
      isPublic: input.isPublic ?? false,
    },
  });
  return { ok: true, data: { id: playlist.id } };
}

async function loadPlaylistRow(playlistId: string) {
  return prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      owner: { select: { id: true, nickname: true } },
      tracks: {
        orderBy: { position: "asc" },
        include: { product: { include: { artist: true } } },
      },
    },
  });
}

export type PlaylistDetail = NonNullable<Awaited<ReturnType<typeof loadPlaylistRow>>>;

/** Read access: owner always; anyone else only if isPublic. Returns null when neither applies. */
export async function getPlaylistForViewer(
  playlistId: string,
  viewerUserId: string | null
): Promise<PlaylistDetail | null> {
  const playlist = await loadPlaylistRow(playlistId);
  if (!playlist) return null;
  if (playlist.ownerUserId !== viewerUserId && !playlist.isPublic) return null;
  return playlist;
}

async function requireOwnedPlaylist(playlistId: string, ownerUserId: string) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist) return { ok: false as const, error: "플레이리스트를 찾을 수 없어요.", status: 404 };
  if (playlist.ownerUserId !== ownerUserId) {
    return { ok: false as const, error: "본인 플레이리스트만 수정할 수 있어요.", status: 403 };
  }
  return { ok: true as const, playlist };
}

export async function updatePlaylist(
  playlistId: string,
  ownerUserId: string,
  input: { title?: string; description?: string; coverUrl?: string; isPublic?: boolean }
): Promise<PlaylistResult<{ id: string }>> {
  const owned = await requireOwnedPlaylist(playlistId, ownerUserId);
  if (!owned.ok) return owned;

  if (input.title !== undefined) {
    const titleError = validateTitle(input.title);
    if (titleError) return { ok: false, error: titleError, status: 400 };
  }

  await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() || null } : {}),
      ...(input.coverUrl !== undefined ? { coverUrl: input.coverUrl.trim() || null } : {}),
      ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
    },
  });
  return { ok: true, data: { id: playlistId } };
}

export async function deletePlaylist(
  playlistId: string,
  ownerUserId: string
): Promise<PlaylistResult<{ id: string }>> {
  const owned = await requireOwnedPlaylist(playlistId, ownerUserId);
  if (!owned.ok) return owned;

  await prisma.playlist.delete({ where: { id: playlistId } });
  return { ok: true, data: { id: playlistId } };
}

export async function addTrackToPlaylist(
  playlistId: string,
  ownerUserId: string,
  productId: string
): Promise<PlaylistResult<{ id: string }>> {
  const owned = await requireOwnedPlaylist(playlistId, ownerUserId);
  if (!owned.ok) return owned;

  const [trackCount, product] = await Promise.all([
    prisma.playlistTrack.count({ where: { playlistId } }),
    prisma.product.findUnique({ where: { id: productId }, select: { type: true } }),
  ]);

  if (!product || (product.type !== "ALBUM" && product.type !== "TRACK")) {
    return { ok: false, error: "음원 상품만 플레이리스트에 담을 수 있어요.", status: 400 };
  }
  if (trackCount >= PLAYLIST_TRACK_MAX_COUNT) {
    return { ok: false, error: `플레이리스트에는 최대 ${PLAYLIST_TRACK_MAX_COUNT}곡까지 담을 수 있어요.`, status: 400 };
  }

  const existing = await prisma.playlistTrack.findUnique({
    where: { playlistId_productId: { playlistId, productId } },
  });
  if (existing) {
    return { ok: false, error: "이미 담긴 곡이에요.", status: 409 };
  }

  const track = await prisma.playlistTrack.create({
    data: { playlistId, productId, position: trackCount },
  });
  return { ok: true, data: { id: track.id } };
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  ownerUserId: string,
  productId: string
): Promise<PlaylistResult<{ id: string }>> {
  const owned = await requireOwnedPlaylist(playlistId, ownerUserId);
  if (!owned.ok) return owned;

  await prisma.playlistTrack.deleteMany({ where: { playlistId, productId } });
  return { ok: true, data: { id: playlistId } };
}

export async function reorderPlaylistTracks(
  playlistId: string,
  ownerUserId: string,
  orderedProductIds: string[]
): Promise<PlaylistResult<{ id: string }>> {
  const owned = await requireOwnedPlaylist(playlistId, ownerUserId);
  if (!owned.ok) return owned;

  const existing = await prisma.playlistTrack.findMany({ where: { playlistId } });
  const existingIds = new Set(existing.map((t) => t.productId));
  const incomingIds = new Set(orderedProductIds);
  if (existingIds.size !== incomingIds.size || [...existingIds].some((id) => !incomingIds.has(id))) {
    return { ok: false, error: "트랙 목록이 최신 상태와 맞지 않아요.", status: 409 };
  }

  await prisma.$transaction(
    orderedProductIds.map((productId, position) =>
      prisma.playlistTrack.update({
        where: { playlistId_productId: { playlistId, productId } },
        data: { position },
      })
    )
  );
  return { ok: true, data: { id: playlistId } };
}
