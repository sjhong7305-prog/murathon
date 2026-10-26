"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@muraton/shared/format";
import { useAuth } from "@/context/auth-context";

interface PostComment {
  id: string;
  authorNickname: string;
  message: string;
  createdAt: string;
}

export function PostCommentBox({
  artistId,
  postId,
  initialCount = 0,
  open: controlledOpen,
  onOpenChange,
}: {
  artistId: string;
  postId: string;
  initialCount?: number;
  /** Controlled from outside (e.g. FeedCard's comment-icon button) when provided; otherwise manages its own toggle. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [canComment, setCanComment] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  useEffect(() => {
    if (!open) return;
    fetch(`/api/artists/${artistId}/posts/${postId}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setComments)
      .catch(() => setComments([]));

    if (isLoggedIn) {
      fetch(`/api/artists/${artistId}/eligibility`)
        .then((res) => (res.ok ? res.json() : { canComment: false }))
        .then((data) => setCanComment(Boolean(data.canComment)))
        .catch(() => setCanComment(false));
    }
  }, [open, artistId, postId, isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/artists/${artistId}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...(prev ?? []), comment]);
        setMessage("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-semibold text-muted hover:text-accent-strong"
      >
        {initialCount > 0 ? `댓글 ${initialCount}개 보기` : "댓글 남기기"}
      </button>
    );
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      {comments === null ? null : (
        <div className="flex flex-col gap-2">
          {comments.length === 0 && (
            <p className="text-xs text-muted">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-cream p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">{c.authorNickname}</span>
                <span className="ml-auto text-[10px] text-muted">{formatDate(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-ink">{c.message}</p>
            </div>
          ))}
        </div>
      )}

      {canComment ? (
        <form onSubmit={handleSubmit} className="mt-2.5 flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="이 소식에 댓글 남기기"
            className="flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
          >
            등록
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => (isLoggedIn ? null : router.push("/login"))}
          className="mt-2.5 w-full cursor-default rounded-lg border border-dashed border-line bg-cream px-3 py-2 text-left text-xs text-muted"
        >
          🔒 팔로우하고 0원이라도 후원하면 대화에 참여할 수 있어요!
        </button>
      )}
    </div>
  );
}
