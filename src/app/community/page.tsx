"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mockPosts } from "@/lib/mock-community";
import { getLocalPosts, getLocalComments, type CommunityPost } from "@/lib/community-storage";
import { AuthorBadge } from "@/components/author-badge";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function CommunityPage() {
  const [state, setState] = useState<{
    posts: CommunityPost[];
    commentCounts: Record<string, number>;
  }>({
    posts: mockPosts,
    commentCounts: Object.fromEntries(mockPosts.map((p) => [p.id, p.comments.length])),
  });

  useEffect(() => {
    const local = getLocalPosts();
    const all = [...local, ...mockPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const commentCounts: Record<string, number> = {};
    for (const post of all) {
      commentCounts[post.id] = post.comments.length + getLocalComments(post.id).length;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- merge locally-created posts/comments from localStorage post-mount
    setState({ posts: all, commentCounts });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">커뮤니티</h1>
          <p className="mt-1 text-sm text-muted">
            팬과 아티스트가 자유롭게 소통하는 공간이에요.
          </p>
        </div>
        <Link
          href="/community/new"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          글쓰기
        </Link>
      </div>

      <div className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {state.posts.map((post) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className="block px-4 py-3 transition hover:bg-black/[0.03]"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">{post.author}</span>
              <AuthorBadge type={post.authorType} />
              <span className="ml-auto shrink-0 text-xs text-muted">
                {formatDate(post.createdAt)}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{post.title}</p>
            <p className="mt-0.5 text-xs text-muted">
              💬 댓글 {state.commentCounts[post.id] ?? 0}개
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
