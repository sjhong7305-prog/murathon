"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatWon } from "@/lib/format";
import { useCatalog } from "@/lib/use-catalog";
import type { Order } from "@/lib/types";

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const catalog = useCatalog();

  useEffect(() => {
    const raw = window.sessionStorage.getItem("muraton-last-order");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from sessionStorage post-mount to avoid SSR mismatch
    setOrder(raw ? JSON.parse(raw) : null);
  }, []);

  if (order === undefined || !catalog) return null;

  if (order === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">주문 내역을 찾을 수 없어요</h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          홈으로 가기
        </Link>
      </div>
    );
  }

  const unlockedSecrets = order.items
    .map((item) => ({ item, product: catalog.getProductById(item.productId) }))
    .filter((entry) => entry.product?.secretContent);

  const primaryArtist = order.primaryArtistId
    ? catalog.getArtistById(order.primaryArtistId)
    : undefined;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-black text-ink">주문이 완료됐어요</h1>
      <p className="mt-2 text-muted">
        {order.name}님, 아티스트를 직접 후원해주셔서 감사합니다.
      </p>
      <p className="mt-1 text-xs text-muted">주문번호 {order.id}</p>

      <div className="mt-8 rounded-xl border border-line bg-surface p-5 text-left">
        <div className="flex flex-col gap-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-ink">
                {item.artistName} · {item.title} {item.quantity > 1 ? `x${item.quantity}` : ""}
              </span>
              <span className="text-muted">{formatWon(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-line pt-3 font-bold text-ink">
          <span>총 후원 금액</span>
          <span>{formatWon(order.total)}</span>
        </div>
        {order.cheerMessage && (
          <p className="mt-4 rounded-lg bg-surface p-3 text-sm italic text-ink">
            “{order.cheerMessage}”
          </p>
        )}
        {order.promptQuestion && order.promptAnswer && (
          <div className="mt-3 rounded-lg border border-line p-3 text-sm">
            <p className="font-semibold text-muted">Q. {order.promptQuestion}</p>
            <p className="mt-1 text-ink">A. {order.promptAnswer}</p>
          </div>
        )}
        {order.listAsSupporter && primaryArtist && (
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent-strong">
            🏆 곧 {primaryArtist.name}의{" "}
            <Link href={`/artists/${primaryArtist.slug}#supporters`} className="underline">
              서포터 페이지
            </Link>
            에 닉네임이 표시돼요
          </p>
        )}
      </div>

      {unlockedSecrets.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 text-left">
          <p className="mb-3 text-sm font-bold text-amber-700">🔓 시크릿 콘텐츠가 해금됐어요</p>
          <div className="flex flex-col gap-3">
            {unlockedSecrets.map(({ item, product }) => (
              <div key={item.productId} className="rounded-lg bg-cream p-3">
                <p className="text-sm font-bold text-ink">{product?.secretContent?.title}</p>
                <p className="mt-1 text-sm text-ink">{product?.secretContent?.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
      >
        다른 아티스트 둘러보기
      </Link>
    </div>
  );
}
