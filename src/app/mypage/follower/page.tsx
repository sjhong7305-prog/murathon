"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getArtistById, getProductById } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { getPurchases, type PurchaseRecord } from "@/lib/purchase-storage";
import { seedCollection } from "@/lib/mock-collection";
import { ProductCard } from "@/components/product-card";
import { CoverArt } from "@/components/cover-art";

const PRIVACY_KEY = "muraton-collection-privacy";
const SEED_FOLLOWED_ARTIST_IDS = ["a1", "a3"];

interface FollowerState {
  purchases: PurchaseRecord[];
  nickname: string;
  privacy: "public" | "private";
}

function mergePurchases(base: PurchaseRecord[], local: PurchaseRecord[]): PurchaseRecord[] {
  const seen = new Set<string>();
  return [...base, ...local].filter((p) => {
    const key = `${p.productId}-${p.purchasedAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function FollowerMyPage() {
  const [state, setState] = useState<FollowerState>({
    purchases: [],
    nickname: "게스트 팬",
    privacy: "private",
  });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const local = getPurchases();
    const savedPrivacy = window.localStorage.getItem(PRIVACY_KEY);
    let nickname = "게스트 팬";
    try {
      const raw = window.sessionStorage.getItem("muraton-last-order");
      if (raw) {
        const order = JSON.parse(raw);
        if (order?.name) nickname = order.name;
      }
    } catch {
      // ignore malformed order snapshot
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate collection/nickname/privacy from browser storage post-mount
    setState({
      purchases: mergePurchases(seedCollection, local),
      nickname,
      privacy: savedPrivacy === "public" ? "public" : "private",
    });
  }, []);

  const togglePrivacy = () => {
    setState((prev) => {
      const next: "public" | "private" = prev.privacy === "private" ? "public" : "private";
      window.localStorage.setItem(PRIVACY_KEY, next);
      return { ...prev, privacy: next };
    });
  };

  const collectionProducts = useMemo(
    () =>
      state.purchases
        .map((p) => getProductById(p.productId))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [state.purchases]
  );

  const followedArtistIds = useMemo(
    () => Array.from(new Set([...SEED_FOLLOWED_ARTIST_IDS, ...state.purchases.map((p) => p.artistId)])),
    [state.purchases]
  );
  const followedArtists = followedArtistIds
    .map((id) => getArtistById(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const totalSpent = state.purchases.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalArtists = followedArtistIds.length;
  const totalOrders = state.purchases.length;

  const spendByArtist: Record<string, number> = {};
  for (const p of state.purchases) {
    spendByArtist[p.artistId] = (spendByArtist[p.artistId] ?? 0) + p.price * p.quantity;
  }
  let topArtistId: string | undefined;
  let topAmount = 0;
  for (const [artistId, amount] of Object.entries(spendByArtist)) {
    if (amount > topAmount) {
      topAmount = amount;
      topArtistId = artistId;
    }
  }
  const topArtist = topArtistId ? getArtistById(topArtistId) : undefined;

  const badges: { icon: string; label: string }[] = [];
  if (totalOrders > 0) badges.push({ icon: "🎖️", label: "첫 후원자" });
  if (topArtist) badges.push({ icon: "🏆", label: `${topArtist.name} 탑 서포터` });
  if (totalArtists >= 3) badges.push({ icon: "💎", label: "멀티 서포터" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-black text-white">
          {state.nickname.slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-semibold text-accent-strong">🎧 Follower My Page</p>
          <h1 className="text-2xl font-black text-ink">{state.nickname}</h1>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-ink">🎮 나의 후원 기록</h2>
        <div className="grid grid-cols-3 gap-2 sm:max-w-md">
          <div className="rounded-xl border border-line bg-surface p-3 text-center">
            <p className="text-lg font-black text-ink">{totalArtists}</p>
            <p className="text-xs text-muted">후원 아티스트</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3 text-center">
            <p className="text-lg font-black text-ink">{totalOrders}</p>
            <p className="text-xs text-muted">총 구매 건수</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3 text-center">
            <p className="truncate text-lg font-black text-ink">{formatWon(totalSpent)}</p>
            <p className="text-xs text-muted">총 후원 금액</p>
          </div>
        </div>
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent-strong"
              >
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-ink">팔로잉 아티스트</h2>
        {followedArtists.length === 0 ? (
          <p className="text-sm text-muted">아직 팔로우한 아티스트가 없어요.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {followedArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug}`}
                className="flex w-24 shrink-0 flex-col items-center gap-1.5 text-center"
              >
                <div className="w-16">
                  <CoverArt
                    gradient={artist.coverColor}
                    label={artist.name}
                    imageUrl={artist.imageUrl}
                    rounded="rounded-full"
                    hideLabel
                  />
                </div>
                <span className="truncate text-xs font-bold text-ink">{artist.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">마이 컬렉션 ({collectionProducts.length})</h2>
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={togglePrivacy}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                state.privacy === "public"
                  ? "border-accent bg-accent/20 text-accent-strong"
                  : "border-line text-ink"
              }`}
            >
              {state.privacy === "public" ? "🌐 Public" : "🔒 Private"}
            </button>
            <button
              type="button"
              onClick={() => setShowTooltip((v) => !v)}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-line text-[11px] text-muted hover:text-ink"
              aria-label="Private/Public 설명 보기"
            >
              i
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-lg border border-line bg-surface p-3 text-xs text-ink shadow-xl">
                기본값은 Private이에요. Public으로 전환하면 다른 팬들에게 내 컬렉션을 보여줄 수 있어요.
              </div>
            )}
          </div>
        </div>

        {collectionProducts.length === 0 ? (
          <div className="mt-4 rounded-xl border border-line bg-surface p-6 text-center">
            <p className="text-sm text-muted">아직 후원한 음원/굿즈가 없어요.</p>
            <Link
              href="/"
              className="mt-3 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-strong"
            >
              아티스트 둘러보기
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {collectionProducts.map((product, idx) => (
              <ProductCard key={`${product.id}-${idx}`} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
