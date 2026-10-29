"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { hasPurchased } from "@/lib/purchase-storage";
import { getLocalComments, addLocalComment, type Comment } from "@/lib/comment-storage";
import { mockComments } from "@/lib/mock-comments";
import { formatDate } from "@muraton/shared/format";

export function CommentSection({ productId }: { productId: string }) {
  const [hydrated, setHydrated] = useState<{ isBuyer: boolean; comments: Comment[] } | null>(null);
  const { nickname } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([hasPurchased(productId), getLocalComments(productId)]).then(
      ([isBuyer, local]) => {
        const base = mockComments[productId] ?? [];
        setHydrated({ isBuyer, comments: [...base, ...local] });
      }
    );
  }, [productId]);

  if (!hydrated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const comment = await addLocalComment(productId, trimmed);
    if (comment) {
      setHydrated((prev) => (prev ? { ...prev, comments: [...prev.comments, comment] } : prev));
    }
    setMessage("");
  };

  return (
    <section className="mt-14">
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">
        댓글 <span className="text-muted tabular-nums">{hydrated.comments.length}</span>
      </h2>

      {hydrated.isBuyer ? (
        <form
          onSubmit={handleSubmit}
          className="mb-4 flex flex-col gap-2 rounded-xl bg-surface p-3"
        >
          <p className="text-sm font-bold text-ink">{nickname}</p>
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="구매자만 남길 수 있는 댓글이에요"
              className="min-h-11 flex-1 rounded-full border border-line bg-surface px-4 text-sm text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="min-h-11 shrink-0 rounded-full bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              등록
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-tone p-3">
          <span className="flex items-center gap-1.5 px-1 text-xs font-bold text-muted">
            <Lock aria-hidden className="size-3.5" />
            이 곡을 구매한 사람만 댓글을 달 수 있습니다
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
