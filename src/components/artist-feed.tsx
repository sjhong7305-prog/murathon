"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/format";
import type { ArtistPost, ArtistPostCategory } from "@/lib/types";

const CATEGORIES: ArtistPostCategory[] = [
  "녹음 비하인드",
  "공연 영상",
  "악기 연주",
  "가사 소개",
  "작업실 일상",
];

function PostLikeButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(false);

  const toggle = () => {
    setCount((n) => (active ? n - 1 : n + 1));
    setActive((a) => !a);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent/15"
          : "border-line hover:border-black/20"
      }`}
    >
      ❤️ <span className="text-ink">{count}</span>
    </button>
  );
}

export function ArtistFeed({ posts }: { posts: ArtistPost[] }) {
  const [activeCategory, setActiveCategory] = useState<ArtistPostCategory | "all">("all");

  if (posts.length === 0) return null;

  const filtered = activeCategory === "all" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-bold text-ink">아티스트 피드</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
            activeCategory === "all"
              ? "border-accent bg-accent text-white"
              : "border-line text-muted hover:border-black/20 hover:text-ink"
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              activeCategory === c
                ? "border-accent bg-accent text-white"
                : "border-line text-muted hover:border-black/20 hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          아직 이 카테고리의 피드가 없어요.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface"
            >
              {post.mediaUrl && (
                <div className="relative aspect-video w-full bg-cream">
                  <Image
                    src={post.mediaUrl}
                    alt={post.category}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <span className="inline-block rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent-strong">
                  {post.category}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-ink">{post.content}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">{formatDate(post.createdAt)}</span>
                  <PostLikeButton initialCount={post.likeCount} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
