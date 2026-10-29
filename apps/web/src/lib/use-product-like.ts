"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

// One shared like state per product, so the bottom player's heart and a list's heart for the same
// release never disagree.
const likes = new Map<string, boolean>();
const requested = new Set<string>();
const listeners = new Set<() => void>();

function setLike(productId: string, liked: boolean) {
  likes.set(productId, liked);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Like ("위시리스트") state for a release, synced with /api/products/:id/like. */
export function useProductLike(productId: string | undefined) {
  const router = useRouter();
  const liked = useSyncExternalStore(
    subscribe,
    () => (productId ? (likes.get(productId) ?? false) : false),
    () => false
  );

  useEffect(() => {
    if (!productId || requested.has(productId)) return;
    requested.add(productId);
    fetch(`/api/products/${productId}/like`)
      .then((res) => (res.ok ? res.json() : { liked: false }))
      .then((data: { liked: boolean }) => setLike(productId, data.liked))
      .catch(() => requested.delete(productId));
  }, [productId]);

  const toggleLike = async () => {
    if (!productId) return;
    const nextLiked = !liked;
    setLike(productId, nextLiked);
    const res = await fetch(`/api/products/${productId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked: nextLiked }),
    }).catch(() => null);
    if (res?.status === 401) {
      setLike(productId, false);
      router.push("/login?message=" + encodeURIComponent("위시리스트에 담으려면 로그인이 필요해요."));
    } else if (!res?.ok) {
      setLike(productId, !nextLiked);
    }
  };

  return { liked, toggleLike };
}
