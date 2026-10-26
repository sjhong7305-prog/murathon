"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function FollowFanButton({
  userId,
  initialFollowing,
}: {
  userId: string;
  initialFollowing: boolean;
}) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/fans/${userId}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      if (res.ok) setFollowing(!following);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition disabled:opacity-60 ${
        following
          ? "border border-line text-ink hover:border-black/30"
          : "border border-accent/40 bg-accent/10 text-accent-strong hover:bg-accent/20"
      }`}
    >
      {following ? "팔로잉 ✓" : "+ 팔로우"}
    </button>
  );
}
