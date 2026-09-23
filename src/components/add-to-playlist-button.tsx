"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PLAYLIST_TITLE_MAX_LENGTH } from "@/lib/playlist-constants";

interface MyPlaylist {
  id: string;
  title: string;
  trackCount: number;
}

export function AddToPlaylistButton({ productId, className }: { productId: string; className?: string }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<MyPlaylist[] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const openModal = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setOpen(true);
    setMessage(null);
    fetch("/api/playlists")
      .then((res) => (res.ok ? res.json() : []))
      .then(setPlaylists)
      .catch(() => setPlaylists([]));
  };

  const addTo = async (playlistId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      setMessage(res.ok ? "플레이리스트에 담았어요 ✓" : data.error ?? "담지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateAndAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "만들지 못했어요.");
        return;
      }
      await addTo(data.id);
      setNewTitle("");
      setCreating(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          className ??
          "rounded-lg border border-line px-2.5 py-1 text-xs font-bold text-ink transition hover:border-accent/50 hover:text-accent-strong"
        }
      >
        + 플레이리스트에 추가
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold text-ink">플레이리스트에 추가</p>

            {message && <p className="mt-2 text-xs font-semibold text-accent-strong">{message}</p>}

            <div className="mt-3 flex max-h-60 flex-col gap-1.5 overflow-y-auto">
              {playlists === null ? (
                <p className="text-xs text-muted">불러오는 중...</p>
              ) : playlists.length === 0 ? (
                <p className="text-xs text-muted">아직 만든 플레이리스트가 없어요.</p>
              ) : (
                playlists.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={busy}
                    onClick={() => addTo(p.id)}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-left text-sm text-ink transition hover:border-accent/50 disabled:opacity-60"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="shrink-0 text-xs text-muted">{p.trackCount}곡</span>
                  </button>
                ))
              )}
            </div>

            {creating ? (
              <div className="mt-3 flex flex-col gap-2">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={PLAYLIST_TITLE_MAX_LENGTH}
                  placeholder="새 플레이리스트 이름"
                  className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy || !newTitle.trim()}
                    onClick={handleCreateAndAdd}
                    className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    만들고 담기
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-ink"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="mt-3 w-full rounded-lg border border-dashed border-line px-3 py-2 text-xs font-bold text-muted hover:border-accent/40 hover:text-accent-strong"
              >
                + 새 플레이리스트 만들기
              </button>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-full border border-line px-4 py-2 text-xs font-bold text-ink"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
