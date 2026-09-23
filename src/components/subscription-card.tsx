"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ChevronDown } from "lucide-react";
import { formatWon } from "@/lib/format";
import { useAuth } from "@/context/auth-context";

type Tier = "MONTHLY" | "YEARLY";

const DEFAULT_BENEFITS = [
  "신곡 자동 발매 알림",
  "백카탈로그 무제한 감상",
  "데모·리믹스 등 구독자 전용 트랙",
  "얼리 액세스",
  "굿즈 할인",
  "비하인드 콘텐츠",
];

export function SubscriptionCard({
  artistId,
  artistName,
  monthlyPrice,
  yearlyPrice,
  benefits,
  variant = "full",
}: {
  artistId: string;
  artistName: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  benefits?: string[];
  /** "compact" is the thin-bordered sidebar teaser (block 4) — same subscribe modal/flow, minimal card. */
  variant?: "full" | "compact";
}) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("MONTHLY");
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const monthly = monthlyPrice ?? 4900;
  const yearly = yearlyPrice ?? 49000;
  const perks = benefits && benefits.length > 0 ? benefits : DEFAULT_BENEFITS;
  const topPerks = perks.slice(0, 2);
  const restPerks = perks.slice(2);
  const price = tier === "MONTHLY" ? monthly : yearly;

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/artists/${artistId}/subscribe`)
      .then((res) => (res.ok ? res.json() : { tier: null }))
      .then((data) => setActiveTier(data.tier ?? null))
      .catch(() => {});
  }, [artistId, isLoggedIn]);

  const openModal = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/artists/${artistId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTier(data.tier ?? null);
        setShowModal(false);
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/artists/${artistId}/subscribe`, { method: "DELETE" });
      if (res.ok) setActiveTier(null);
    } finally {
      setConfirming(false);
    }
  };

  if (variant === "compact") {
    return (
      <>
        <section
          className="rounded-2xl border p-4"
          style={{ borderColor: "color-mix(in srgb, var(--artist-text) 15%, transparent)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: "var(--artist-text)" }}>
                {artistName} 멤버십에 가입해보세요
              </p>
              <p className="mt-0.5 text-xs opacity-70" style={{ color: "var(--artist-text)" }}>
                월 {formatWon(monthly)}부터
              </p>
            </div>
            {activeTier ? (
              <span
                className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold"
                style={{ borderColor: "var(--artist-accent)", color: "var(--artist-accent)" }}
              >
                구독중 ✓
              </span>
            ) : (
              <button
                type="button"
                onClick={openModal}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--artist-accent)" }}
              >
                구독하기
              </button>
            )}
          </div>
        </section>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => !confirming && setShowModal(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-accent-strong">MU:RATHON 구독</p>
              <h2 className="mt-1 text-xl font-bold text-ink">{artistName} 구독하기</h2>

              <div className="mt-4 flex rounded-full border border-line bg-surface p-1">
                <button
                  type="button"
                  onClick={() => setTier("MONTHLY")}
                  className={`flex-1 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    tier === "MONTHLY" ? "bg-accent text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  월간 {formatWon(monthly)}
                </button>
                <button
                  type="button"
                  onClick={() => setTier("YEARLY")}
                  className={`flex-1 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    tier === "YEARLY" ? "bg-accent text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  연간 {formatWon(yearly)}
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink">
                {tier === "MONTHLY" ? "매달" : "매년"} {formatWon(price)}으로 {artistName}의 구독자 전용
                콘텐츠와 혜택을 받아볼 수 있어요.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-cream px-3 py-2">
                <span className="text-sm text-muted">{tier === "MONTHLY" ? "월 구독료" : "연 구독료"}</span>
                <span className="text-sm font-bold text-ink">
                  {formatWon(price)} / {tier === "MONTHLY" ? "월" : "년"}
                </span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <Lock size={12} /> 프로토타입이므로 실제 결제는 이루어지지 않습니다.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={confirming}
                  className="flex-1 rounded-full border border-line px-4 py-2.5 text-sm font-bold text-ink transition hover:border-black/30 disabled:opacity-60"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
                >
                  {confirming ? "처리중..." : "구독 확정"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="rounded-2xl border border-line p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-muted">MU:RATHON MEMBERSHIP</p>
          <p className="mt-1 text-sm text-ink">
            <span className="font-bold">{artistName}</span> 구독하고 특별한 혜택을 받아보세요 · 월{" "}
            {formatWon(monthly)}부터
          </p>
        </div>
        {activeTier ? (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent-strong">
            {activeTier === "MONTHLY" ? "월간 구독중 ✓" : "연간 구독중 ✓"}
          </span>
        ) : (
          <button
            type="button"
            onClick={openModal}
            className="rounded-full border border-accent/40 px-4 py-2 text-xs font-bold text-accent-strong transition hover:bg-accent/10"
          >
            구독하기
          </button>
        )}
      </div>

      <ul className="mt-4 flex flex-col gap-1.5">
        {topPerks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm text-ink">
            <Check size={14} className="mt-0.5 shrink-0 text-accent-strong" />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      {restPerks.length > 0 && (
        <>
          {showAllBenefits && (
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {restPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-ink">
                  <Check size={14} className="mt-0.5 shrink-0 text-accent-strong" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setShowAllBenefits((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-ink"
          >
            {showAllBenefits ? "혜택 접기" : "혜택 전체 보기"}
            <ChevronDown size={12} className={`transition ${showAllBenefits ? "rotate-180" : ""}`} />
          </button>
        </>
      )}

      {activeTier && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={confirming}
          className="mt-4 rounded-full border border-line px-4 py-2 text-xs font-bold text-ink transition hover:border-black/30 disabled:opacity-60"
        >
          구독 해지
        </button>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !confirming && setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-accent-strong">MU:RATHON 구독</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{artistName} 구독하기</h2>

            <div className="mt-4 flex rounded-full border border-line bg-surface p-1">
              <button
                type="button"
                onClick={() => setTier("MONTHLY")}
                className={`flex-1 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  tier === "MONTHLY" ? "bg-accent text-white" : "text-muted hover:text-ink"
                }`}
              >
                월간 {formatWon(monthly)}
              </button>
              <button
                type="button"
                onClick={() => setTier("YEARLY")}
                className={`flex-1 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  tier === "YEARLY" ? "bg-accent text-white" : "text-muted hover:text-ink"
                }`}
              >
                연간 {formatWon(yearly)}
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink">
              {tier === "MONTHLY" ? "매달" : "매년"} {formatWon(price)}으로 {artistName}의 구독자 전용
              콘텐츠와 혜택을 받아볼 수 있어요.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-cream px-3 py-2">
              <span className="text-sm text-muted">{tier === "MONTHLY" ? "월 구독료" : "연 구독료"}</span>
              <span className="text-sm font-bold text-ink">
                {formatWon(price)} / {tier === "MONTHLY" ? "월" : "년"}
              </span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <Lock size={12} /> 프로토타입이므로 실제 결제는 이루어지지 않습니다.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={confirming}
                className="flex-1 rounded-full border border-line px-4 py-2.5 text-sm font-bold text-ink transition hover:border-black/30 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
              >
                {confirming ? "처리중..." : "구독 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
