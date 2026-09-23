"use client";

import { useState } from "react";

export function PrivacyToggle({ initialPrivacy }: { initialPrivacy: "PUBLIC" | "PRIVATE" }) {
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [busy, setBusy] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const toggle = async () => {
    const next = privacy === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    setBusy(true);
    try {
      const res = await fetch("/api/fan/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionPrivacy: next }),
      });
      if (res.ok) setPrivacy(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
          privacy === "PUBLIC"
            ? "border-accent bg-accent/20 text-accent-strong"
            : "border-line text-ink"
        }`}
      >
        {privacy === "PUBLIC" ? "🌐 내 컬렉션 공개" : "🔒 비공개"}
      </button>
      <button
        type="button"
        onClick={() => setShowTooltip((v) => !v)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-line text-[11px] text-muted hover:text-ink"
        aria-label="공개/비공개 설명 보기"
      >
        i
      </button>
      {showTooltip && (
        <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-lg border border-line bg-surface p-3 text-xs text-ink shadow-xl">
          기본값은 공개예요. 비공개로 전환하면 다른 팬들에게 구매 내역과 서포터 코멘트가 보이지 않아요.
        </div>
      )}
    </div>
  );
}
