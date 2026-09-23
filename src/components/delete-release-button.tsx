"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteReleaseButton({
  artistId,
  productId,
  title,
}: {
  artistId: string;
  productId: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `"${title}"을(를) 삭제할까요? 스토어와 아티스트 페이지에서 즉시 내려가고, 새로운 구매는 막혀요. 이미 구매한 팬은 계속 라이브러리에서 들을 수 있어요.`
      )
    )
      return;
    setPending(true);
    try {
      const res = await fetch(`/api/artists/${artistId}/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error ?? "삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-muted transition hover:border-rose-400/50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}
