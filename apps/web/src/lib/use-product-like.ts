"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

// One shared like state per product, so the bottom player's heart and a list's heart for the same
// release never disagree.
const likes = new Map<string, boolean>();
const requested = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;
/** Whose likes the store holds. `undefined` until the session is first known. */
let owner: string | null | undefined;

/** Drops cached likes when the logged-in account changes (login, logout, switching accounts). */
function syncOwner(userId: string | null) {
  if (owner !== undefined && owner !== userId) {
    likes.clear();
    requested.clear();
    version += 1;
    listeners.forEach((listener) => listener());
  }
  owner = userId;
}

function setLike(productId: string, liked: boolean) {
  likes.set(productId, liked);
  version += 1;
  listeners.forEach((listener) => listener());
}

/**
 * Seeds releases already known to be liked (e.g. the wishlist page's server data) so their hearts
 * don't each re-ask the API. Client-only and silent: safe to call during render.
 */
export function primeLikes(productIds: string[]) {
  if (typeof window === "undefined") return;
  for (const id of productIds) {
    if (!likes.has(id)) likes.set(id, true);
    requested.add(id);
  }
}

/** Liked state as currently known on this client (`undefined` until loaded). */
export function knownLike(productId: string): boolean | undefined {
  return likes.get(productId);
}

/** Re-renders the caller whenever any like changes; pair with knownLike to read it. */
export function useLikesVersion() {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Like ("위시리스트") state for a release, synced with /api/products/:id/like. */
export function useProductLike(productId: string | undefined) {
  const router = useRouter();
  const { userId, loading } = useAuth();
  const liked = useSyncExternalStore(
    subscribe,
    () => (productId ? (likes.get(productId) ?? false) : false),
    () => false
  );

  useEffect(() => {
    if (loading) return;
    syncOwner(userId);
    if (!productId || requested.has(productId)) return;
    requested.add(productId);
    fetch(`/api/products/${productId}/like`)
      .then((res) => (res.ok ? res.json() : { liked: false }))
      .then((data: { liked: boolean }) => setLike(productId, data.liked))
      .catch(() => requested.delete(productId));
  }, [productId, userId, loading]);

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
