"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function FollowArtistButton({ artistId }: { artistId: string }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/artists/${artistId}/follow`)
      .then((res) => (res.ok ? res.json() : { following: false }))
      .then((data) => setFollowing(Boolean(data.following)))
      .catch(() => {});
  }, [artistId, isLoggedIn]);

  const toggle = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/artists/${artistId}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(Boolean(data.following));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-bold transition disabled:opacity-60 ${
        following
          ? "border border-line text-ink hover:border-black/30"
          : "bg-accent text-white shadow-sm hover:bg-accent-strong"
      }`}
    >
      {following ? "팔로잉" : "팔로우"}
    </button>
  );
}
