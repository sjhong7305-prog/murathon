"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, Lock, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { formatRelativeTime } from "@muraton/shared/format";
import { PostCommentBox } from "./post-comment-box";
import { FeedMediaGrid } from "./feed-media-grid";
import { CATEGORY_BADGE_CLASS, CATEGORY_LABEL, VISIBILITY_LABEL, CATEGORY_OPTIONS, VISIBILITY_OPTIONS } from "@/lib/artist-feed-labels";
import type { ArtistPostCategory, ArtistPostVisibility } from "@muraton/db";
import type { FeedPostView } from "@/lib/artist-feed";

const LOCK_MESSAGE: Record<"SUPPORTER" | "SUBSCRIBER", string> = {
  SUPPORTER: "구매한 팬만 볼 수 있어요",
  SUBSCRIBER: "구독자만 볼 수 있어요",
};

const FIELD_CLASS =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent";

function FeedLikeButton({
  artistId,
  postId,
  initialLiked,
  initialCount,
  onCountChange,
}: {
  artistId: string;
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  onCountChange: (count: number) => void;
}) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    onCountChange(initialCount + (next ? 1 : -1));
    try {
      const res = await fetch(`/api/artists/${artistId}/posts/${postId}/like`, { method: next ? "POST" : "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setLiked(Boolean(data.liked));
        onCountChange(data.likeCount);
      } else {
        setLiked(!next);
        onCountChange(initialCount);
      }
    } catch {
      setLiked(!next);
      onCountChange(initialCount);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-label="좋아요" className="disabled:opacity-60">
      <Heart size={22} className={liked ? "fill-rose-500 text-rose-500" : "text-ink"} />
    </button>
  );
}

function OwnerMenu({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative ml-auto shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="게시물 메뉴"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-ink"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-10 w-28 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="block w-full px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-cream"
          >
            수정
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="block w-full px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-cream disabled:opacity-60"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      )}
    </div>
  );
}

export function FeedCard({
  post,
  onUpdated,
  onDeleted,
}: {
  post: FeedPostView;
  /** Splice an in-place edit into the parent list's state (never a local-only fake update). */
  onUpdated?: (id: string, patch: Partial<FeedPostView>) => void;
  onDeleted?: (id: string) => void;
}) {
  const { artists } = useAuth();
  const isOwner = artists.some((a) => a.id === post.artistId);

  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState<ArtistPostCategory>(post.categoryValue);
  const [editContent, setEditContent] = useState(post.content ?? "");
  const [editVisibility, setEditVisibility] = useState<ArtistPostVisibility>(post.visibility);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const lockMessage = post.visibility !== "PUBLIC" ? LOCK_MESSAGE[post.visibility as "SUPPORTER" | "SUBSCRIBER"] : null;

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: post.authorName, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert("링크를 복사했어요."));
    }
  };

  const startEdit = () => {
    setEditCategory(post.categoryValue);
    setEditContent(post.content ?? "");
    setEditVisibility(post.visibility);
    setEditError(null);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    setSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/artists/${post.artistId}/feed/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: editCategory, content: trimmed, visibility: editVisibility }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "수정하지 못했어요.");
        return;
      }
      onUpdated?.(post.id, {
        category: CATEGORY_LABEL[editCategory],
        categoryValue: editCategory,
        content: trimmed,
        visibility: editVisibility,
        locked: editVisibility !== "PUBLIC" ? post.locked : false,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 게시물을 삭제할까요?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/artists/${post.artistId}/feed/${post.id}`, { method: "DELETE" });
      if (res.ok) onDeleted?.(post.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="w-full border-b border-line bg-surface sm:mb-6 sm:rounded-2xl sm:border">
      <header className="flex items-start gap-2.5 px-3 py-2.5">
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-cream">
          {post.authorImageUrl && (
            <Image src={post.authorImageUrl} alt={post.authorName} width={32} height={32} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5">
            <Link href={`/artists/${post.artistSlug}`} className="truncate text-sm font-bold text-ink hover:underline">
              {post.authorName}
            </Link>
            {post.authorRoleLabel && <span className="text-sm font-normal text-muted">{post.authorRoleLabel}</span>}
            <span className="text-xs text-muted">· {formatRelativeTime(post.createdAt)}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${CATEGORY_BADGE_CLASS[post.categoryValue]}`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold text-ink">
              {post.visibility !== "PUBLIC" && <Lock size={9} />}
              {VISIBILITY_LABEL[post.visibility]}
            </span>
          </div>
        </div>
        {isOwner && <OwnerMenu onEdit={startEdit} onDelete={handleDelete} deleting={deleting} />}
      </header>

      {editing ? (
        <div className="flex flex-col gap-3 px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as ArtistPostCategory)} className={FIELD_CLASS}>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value as ArtistPostVisibility)}
              className={FIELD_CLASS}
            >
              {VISIBILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className={FIELD_CLASS} />
          {editError && (
            <p className="text-sm font-semibold text-rose-600" role="alert">
              {editError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="flex-1 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving || !editContent.trim()}
              className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {!post.locked && post.content && (
            <div className="px-3 pb-2.5">
              <p className={`whitespace-pre-wrap text-sm leading-relaxed text-ink ${expanded ? "" : "line-clamp-3"}`}>
                {post.content}
              </p>
              {post.content.length > 90 && !expanded && (
                <button type="button" onClick={() => setExpanded(true)} className="mt-0.5 text-xs font-semibold text-muted">
                  더 보기
                </button>
              )}
            </div>
          )}

          {post.locked ? (
            <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
                <Lock size={18} className="text-accent-strong" />
              </span>
              <p className="text-sm font-bold text-white">{lockMessage}</p>
              <Link
                href={`/artists/${post.artistSlug}`}
                className="mt-1 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-accent-strong"
              >
                아티스트 페이지로
              </Link>
            </div>
          ) : (
            post.media.length > 0 && <FeedMediaGrid media={post.media} />
          )}

          {!post.locked && (
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-4 border-t border-line pt-2.5">
                <FeedLikeButton
                  artistId={post.artistId}
                  postId={post.id}
                  initialLiked={post.isLiked}
                  initialCount={post.likeCount}
                  onCountChange={setLikeCount}
                />
                <button type="button" onClick={() => setCommentsOpen((v) => !v)} aria-label="댓글">
                  <MessageCircle size={22} className="text-ink" />
                </button>
                <button type="button" onClick={handleShare} aria-label="공유">
                  <Share2 size={20} className="text-ink" />
                </button>
              </div>

              <p className="mt-2 text-sm font-bold text-ink">좋아요 {likeCount}개</p>

              <PostCommentBox
                artistId={post.artistId}
                postId={post.id}
                initialCount={post.commentCount}
                open={commentsOpen}
                onOpenChange={setCommentsOpen}
              />
            </div>
          )}
        </>
      )}
    </article>
  );
}
