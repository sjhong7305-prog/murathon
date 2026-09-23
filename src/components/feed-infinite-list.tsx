"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FeedCard } from "./feed-card";
import type { FeedPage, FeedPostView } from "@/lib/artist-feed";

export interface FeedInfiniteListHandle {
  /** Prepend a freshly-created post (e.g. from the composer) without a full refetch. */
  prepend: (post: FeedPostView) => void;
}

/**
 * Cursor-paginated, scroll-triggered feed list. Dedup is belt-and-suspenders: the server cursor
 * (orderBy createdAt+id desc, cursor on id) already can't skip/repeat rows even if new posts land
 * at the top mid-scroll, but we also track seen ids client-side in case a page is ever re-fetched.
 */
export const FeedInfiniteList = forwardRef<FeedInfiniteListHandle, {
  endpoint: string;
  /** Pass a real array for SSR-seeded fast first paint; pass null to have this component fetch its own first page on mount (e.g. when a client-side filter changes the endpoint after initial render). */
  initialPosts: FeedPostView[] | null;
  initialNextCursor: string | null;
  emptyMessage?: string;
}>(function FeedInfiniteList(
  { endpoint, initialPosts, initialNextCursor, emptyMessage = "아직 게시물이 없어요." },
  ref
) {
  const [posts, setPosts] = useState(initialPosts ?? []);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(initialPosts === null);
  const [hasMore, setHasMore] = useState(initialPosts === null ? false : initialNextCursor !== null);
  const cursorRef = useRef(initialPosts === null ? null : initialNextCursor);
  const loadingRef = useRef(false);
  const seenIds = useRef(new Set((initialPosts ?? []).map((p) => p.id)));
  const sentinelRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    prepend: (post: FeedPostView) => {
      seenIds.current.add(post.id);
      setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
    },
  }));

  useEffect(() => {
    if (initialPosts !== null) return;
    let cancelled = false;
    setLoadingInitial(true);
    fetch(endpoint)
      .then((res) => (res.ok ? res.json() : { posts: [], nextCursor: null }))
      .then((data: FeedPage) => {
        if (cancelled) return;
        seenIds.current = new Set(data.posts.map((p) => p.id));
        setPosts(data.posts);
        cursorRef.current = data.nextCursor;
        setHasMore(data.nextCursor !== null);
      })
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });
    return () => {
      cancelled = true;
    };
    // Intentionally runs once per mount (a `key` change on the parent, e.g. switching filters, remounts this component fresh).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !cursorRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const sep = endpoint.includes("?") ? "&" : "?";
      const res = await fetch(`${endpoint}${sep}cursor=${encodeURIComponent(cursorRef.current)}`);
      if (!res.ok) return;
      const data: FeedPage = await res.json();
      const fresh = data.posts.filter((p) => !seenIds.current.has(p.id));
      fresh.forEach((p) => seenIds.current.add(p.id));
      setPosts((prev) => [...prev, ...fresh]);
      cursorRef.current = data.nextCursor;
      setHasMore(data.nextCursor !== null);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "800px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleUpdated = useCallback((id: string, patch: Partial<FeedPostView>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  if (loadingInitial) {
    return <p className="py-16 text-center text-xs text-muted">불러오는 중...</p>;
  }
  if (posts.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col">
      {posts.map((p) => (
        <FeedCard key={p.id} post={p} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      ))}
      {hasMore && <div ref={sentinelRef} className="h-1" />}
      {loading && <p className="py-4 text-center text-xs text-muted">불러오는 중...</p>}
    </div>
  );
});
