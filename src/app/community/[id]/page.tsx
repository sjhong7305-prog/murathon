"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import {
  getPost,
  addLocalComment,
  type CommunityPost,
  type CommunityComment,
  type AuthorType,
} from "@/lib/community-storage";
import { AuthorBadge } from "@/components/author-badge";
import { MiniTrackCard } from "@/components/community/mini-track-card";
import { formatDateTime } from "@/lib/format";

export default function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const { isLoggedIn, activeArtist, nickname } = useAuth();

  const [hydrated, setHydrated] = useState<{
    post: CommunityPost | null;
    comments: CommunityComment[];
  } | null>(null);

  const [authorType, setAuthorType] = useState<AuthorType>(
    activeArtist ? "artist" : "follower"
  );
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getPost(postId).then((post) => {
      setHydrated({ post, comments: post?.comments ?? [] });
    });
  }, [postId]);

  useEffect(() => {
    if (activeArtist) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill artist nickname once the session loads
      setAuthor(activeArtist.name);
      return;
    }
    if (!isLoggedIn) return;
    if (nickname) {
      setAuthor(nickname);
      return;
    }
    try {
      const raw = window.sessionStorage.getItem("muraton-last-order");
      if (raw) {
        const order = JSON.parse(raw);
        if (order?.name) setAuthor(order.name);
      }
    } catch {
      // ignore malformed order snapshot
    }
  }, [activeArtist, isLoggedIn, nickname]);

  if (!hydrated) return null;

  if (!hydrated.post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">글을 찾을 수 없어요</h1>
        <Link
          href="/community"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          커뮤니티로 돌아가기
        </Link>
      </div>
    );
  }

  const { post } = hydrated;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const comment = await addLocalComment(postId, { author, authorType, message: trimmed });
    setHydrated((prev) => (prev ? { ...prev, comments: [...prev.comments, comment] } : prev));
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm text-muted">
        <Link href="/community" className="hover:text-ink">
          커뮤니티
        </Link>
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span className="font-bold text-ink">{post.author}</span>
        <AuthorBadge type={post.authorType} />
        <span className="ml-auto shrink-0 text-xs text-muted">
          {formatDateTime(post.createdAt)}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-black text-ink">{post.title}</h1>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {post.body}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-strong"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {post.attachedProduct && <MiniTrackCard product={post.attachedProduct} />}

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-ink">댓글 {hydrated.comments.length}개</h2>

        <form
          onSubmit={handleSubmit}
          className="mb-4 flex flex-col gap-2 rounded-xl border border-line bg-surface p-3"
        >
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-2 rounded-full border border-line bg-surface p-1">
              <button
                type="button"
                onClick={() => setAuthorType("follower")}
                className={`rounded-full py-1.5 text-xs font-bold transition ${
                  authorType === "follower"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                팔로워로 댓글
              </button>
              <button
                type="button"
                onClick={() => setAuthorType("artist")}
                className={`rounded-full py-1.5 text-xs font-bold transition ${
                  authorType === "artist"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                아티스트로 댓글
              </button>
            </div>
          )}
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="닉네임"
            className="w-32 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="댓글을 남겨보세요"
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

        <div className="flex flex-col gap-3">
          {hydrated.comments.length === 0 && (
            <p className="text-sm text-muted">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
          )}
          {hydrated.comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-surface p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">{c.author}</span>
                <AuthorBadge type={c.authorType} />
                <span className="ml-auto shrink-0 text-xs text-muted">
                  {formatDateTime(c.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-ink">{c.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
