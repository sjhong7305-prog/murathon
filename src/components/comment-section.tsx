"use client";

import { useEffect, useState } from "react";
import { hasPurchased } from "@/lib/purchase-storage";
import { getLocalComments, addLocalComment, type Comment } from "@/lib/comment-storage";
import { mockComments } from "@/lib/mock-comments";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function CommentSection({ productId }: { productId: string }) {
  const [hydrated, setHydrated] = useState<{ isBuyer: boolean; comments: Comment[] } | null>(null);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const isBuyer = hasPurchased(productId);
    const base = mockComments[productId] ?? [];
    const local = getLocalComments(productId);

    let prefillNickname = "";
    try {
      const raw = window.sessionStorage.getItem("muraton-last-order");
      if (raw) {
        const order = JSON.parse(raw);
        if (order?.name) prefillNickname = order.name;
      }
    } catch {
      // ignore malformed order snapshot
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate buyer status + comments from browser storage post-mount
    setHydrated({ isBuyer, comments: [...base, ...local] });
    if (prefillNickname) {
      setNickname(prefillNickname);
    }
  }, [productId]);

  if (!hydrated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    addLocalComment(productId, nickname, trimmed);
    setHydrated((prev) =>
      prev
        ? {
            ...prev,
            comments: [
              ...prev.comments,
              { nickname: nickname.trim() || "익명의 팬", message: trimmed, createdAt: new Date().toISOString() },
            ],
          }
        : prev
    );
    setMessage("");
  };

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold text-ink">댓글 {hydrated.comments.length}개</h2>

      {hydrated.isBuyer ? (
        <form
          onSubmit={handleSubmit}
          className="mb-4 flex flex-col gap-2 rounded-xl border border-line bg-surface p-3"
        >
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            className="w-32 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="구매자만 남길 수 있는 댓글이에요"
              className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              등록
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-surface p-3">
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-muted">
            🔒 이 곡을 구매한 사람만 댓글을 달 수 있습니다
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {hydrated.comments.length === 0 && (
          <p className="text-sm text-muted">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
        )}
        {hydrated.comments.map((c, idx) => (
          <div key={`${c.createdAt}-${idx}`} className="rounded-lg bg-surface p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">{c.nickname}</span>
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                ✓ Verified Buyer
              </span>
              <span className="ml-auto text-xs text-muted">{formatDate(c.createdAt)}</span>
            </div>
            <p className="mt-1 text-ink">{c.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
