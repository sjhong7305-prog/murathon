"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAYLIST_TITLE_MAX_LENGTH } from "@/lib/playlist-constants";

export function CreatePlaylistButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "만들지 못했어요.");
        return;
      }
      router.push(`/playlists/${data.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
      >
        + 새 플레이리스트
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold text-ink">새 플레이리스트</p>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={PLAYLIST_TITLE_MAX_LENGTH}
              placeholder="플레이리스트 이름"
              className="mt-3 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={busy || !title.trim()}
                className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? "만드는 중..." : "만들기"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-line px-4 py-2.5 text-sm font-bold text-ink"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
