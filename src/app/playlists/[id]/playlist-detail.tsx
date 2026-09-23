"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CoverArt } from "@/components/cover-art";
import { usePlayer } from "@/context/player-context";
import { PLAYLIST_TITLE_MAX_LENGTH } from "@/lib/playlist-constants";

export interface PlaylistTrackData {
  productId: string;
  title: string;
  type: string;
  coverColor: string;
  imageUrl: string | null;
  artistName: string;
  artistSlug: string;
}

export interface PlaylistData {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  isOwner: boolean;
  ownerNickname: string;
  tracks: PlaylistTrackData[];
}

export function PlaylistDetail({ playlist }: { playlist: PlaylistData }) {
  const router = useRouter();
  const { playQueue } = usePlayer();
  const [tracks, setTracks] = useState(playlist.tracks);
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description ?? "");
  const [isPublic, setIsPublic] = useState(playlist.isPublic);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const toPlayerTrack = (t: PlaylistTrackData) => ({
    productId: t.productId,
    title: t.title,
    artistName: t.artistName,
    artistSlug: t.artistSlug,
    coverColor: t.coverColor,
    imageUrl: t.imageUrl,
  });

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playQueue(tracks.map(toPlayerTrack), 0);
  };

  const handlePlayFrom = (index: number) => {
    playQueue(tracks.map(toPlayerTrack), index);
  };

  const handleRemove = async (productId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/playlists/${playlist.id}/tracks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) setTracks((prev) => prev.filter((t) => t.productId !== productId));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveMeta = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/playlists/${playlist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, isPublic }),
      });
      if (res.ok) setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 플레이리스트를 삭제할까요?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/playlists/${playlist.id}`, { method: "DELETE" });
      if (res.ok) router.push("/");
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  const commitReorder = async (nextTracks: PlaylistTrackData[]) => {
    setTracks(nextTracks);
    await fetch(`/api/playlists/${playlist.id}/tracks/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: nextTracks.map((t) => t.productId) }),
    });
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...tracks];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    commitReorder(next);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {editing ? (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={PLAYLIST_TITLE_MAX_LENGTH}
            className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-lg font-black text-ink outline-none focus:border-accent"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="설명 (선택)"
            className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            공개 (링크로 누구나 볼 수 있어요)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveMeta}
              disabled={busy || !title.trim()}
              className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-line px-4 py-2 text-sm font-bold text-ink"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-accent-strong">🎵 플레이리스트</p>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-2xl font-black text-ink">{title}</h1>
            {playlist.isOwner && (
              <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-muted">
                {isPublic ? "공개" : "비공개"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">by {playlist.ownerNickname}</p>
          {description && <p className="mt-2 text-sm text-ink">{description}</p>}
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-50"
        >
          ▶ 전체 재생
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/30"
        >
          {copied ? "복사됨 ✓" : "🔗 링크 복사"}
        </button>
        {playlist.isOwner && !editing && (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/30"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-muted transition hover:border-rose-400/50 hover:text-rose-600"
            >
              삭제
            </button>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-1.5">
        {tracks.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted">아직 담긴 곡이 없어요.</p>
        ) : (
          tracks.map((t, index) => (
            <div
              key={t.productId}
              draggable={playlist.isOwner}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface ${
                dragIndex === index ? "opacity-40" : ""
              }`}
            >
              {playlist.isOwner && (
                <span className="shrink-0 cursor-grab select-none text-muted" aria-hidden>
                  ⠿
                </span>
              )}
              <button type="button" onClick={() => handlePlayFrom(index)} className="w-11 shrink-0">
                <CoverArt
                  gradient={t.coverColor}
                  label={t.title}
                  imageUrl={t.imageUrl ?? undefined}
                  hideLabel
                  rounded="rounded-lg"
                  sizes="44px"
                />
              </button>
              <button type="button" onClick={() => handlePlayFrom(index)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-ink">{t.title}</p>
              </button>
              <Link
                href={`/artists/${t.artistSlug}`}
                className="shrink-0 truncate text-xs text-muted hover:text-accent-strong"
              >
                {t.artistName}
              </Link>
              {playlist.isOwner && (
                <button
                  type="button"
                  onClick={() => handleRemove(t.productId)}
                  disabled={busy}
                  className="shrink-0 rounded-lg border border-line px-2 py-1 text-xs font-bold text-muted transition hover:border-rose-400/50 hover:text-rose-600"
                >
                  제거
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
