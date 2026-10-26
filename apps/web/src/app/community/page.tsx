"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getLocalPosts, type CommunityPost } from "@/lib/community-storage";
import { useCatalog } from "@/lib/use-catalog";
import { PostCard } from "@/components/community/post-card";
import { LeftRail } from "@/components/community/left-rail";
import { RightRail } from "@/components/community/right-rail";

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const catalog = useCatalog();

  useEffect(() => {
    getLocalPosts().then(setPosts);
  }, []);

  const commentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const post of posts) map[post.id] = post.comments.length;
    return map;
  }, [posts]);

  const trendingTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [posts]);

  const communityArtists = useMemo(() => {
    const seen = new Map<string, string | null>();
    for (const post of posts) {
      if (post.authorType !== "artist" || seen.has(post.author)) continue;
      const match = catalog?.artists.find((a) => a.name === post.author);
      seen.set(post.author, match?.slug ?? null);
    }
    return [...seen.entries()].map(([name, slug]) => ({ name, slug }));
  }, [posts, catalog]);

  const hotPosts = useMemo(() => {
    return [...posts]
      .map((post) => ({ post, commentCount: post.comments.length }))
      .filter((item) => item.commentCount > 0)
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 3);
  }, [posts]);

  const trendingTracks = useMemo(() => {
    if (!catalog) return [];
    return catalog.products
      .filter((p) => p.type === "track" || p.type === "album")
      .slice(-5)
      .reverse();
  }, [catalog]);

  const visiblePosts = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">커뮤니티</h1>
          <p className="mt-1 text-sm text-muted">
            팬과 아티스트가 음악을 나누고, 떠들고, 놀러 오는 공간이에요.
          </p>
        </div>
        <Link
          href="/community/new"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          글쓰기
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr_1fr]">
        <aside className="hidden lg:block">
          <LeftRail
            trendingTags={trendingTags}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
            communityArtists={communityArtists}
          />
        </aside>

        <main className="min-w-0">
          <Link
            href="/community/new"
            className="block rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted transition hover:border-accent/40 hover:text-ink"
          >
            무슨 곡 듣고 있어요? 자유롭게 이야기해보세요 ✏️
          </Link>

          {activeTag && (
            <p className="mt-4 text-sm text-muted">
              <span className="font-bold text-accent-strong">#{activeTag}</span> 태그 글만 보고 있어요
            </p>
          )}

          <div className="mt-4 flex flex-col gap-4">
            {visiblePosts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
                아직 글이 없어요. 첫 글을 남겨보세요!
              </p>
            )}
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} commentCount={commentCounts[post.id] ?? 0} />
            ))}
          </div>
        </main>

        <aside className="hidden lg:block">
          <RightRail hotPosts={hotPosts} trendingTracks={trendingTracks} />
        </aside>
      </div>
    </div>
  );
}
