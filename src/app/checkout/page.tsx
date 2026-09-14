"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { getArtistById, getProductById } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { addLocalSupporter } from "@/lib/supporters-storage";
import { addPurchases } from "@/lib/purchase-storage";
import type { Order } from "@/lib/types";

const QUICK_EMOJIS = ["❤️", "🙏", "🔥", "✨"];

function generateOrderId() {
  return `MRT-${Date.now().toString(36).toUpperCase()}`;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cheerMessage, setCheerMessage] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [listAsSupporter, setListAsSupporter] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">장바구니가 비어있어요</h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          아티스트 둘러보기
        </Link>
      </div>
    );
  }

  const firstProduct = getProductById(items[0].productId);
  const primaryArtist = firstProduct ? getArtistById(firstProduct.artistId) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (listAsSupporter && primaryArtist) {
      addLocalSupporter(primaryArtist.id, name);
    }

    addPurchases(
      items.map((item) => ({
        productId: item.productId,
        artistId: getProductById(item.productId)?.artistId ?? "",
        price: item.price,
        quantity: item.quantity,
      }))
    );

    const order: Order = {
      id: generateOrderId(),
      name,
      email,
      cheerMessage,
      promptQuestion: primaryArtist?.checkoutQuestion,
      promptAnswer: primaryArtist?.checkoutQuestion ? promptAnswer : undefined,
      listAsSupporter,
      primaryArtistId: primaryArtist?.id,
      items: items.map((item) => {
        const product = getProductById(item.productId);
        const artist = product ? getArtistById(product.artistId) : undefined;
        return {
          productId: item.productId,
          title: product?.title ?? "알 수 없는 상품",
          artistName: artist?.name ?? "",
          price: item.price,
          quantity: item.quantity,
        };
      }),
      total: totalPrice,
    };

    window.sessionStorage.setItem("muraton-last-order", JSON.stringify(order));
    clearCart();
    router.push("/checkout/success");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-black text-ink">결제하기</h1>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted">이름</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">이메일</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">응원 메시지 (선택)</label>
            <div className="mb-2 flex gap-1.5">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setCheerMessage((m) => `${m}${emoji}`)}
                  className="rounded-full border border-line px-2.5 py-1 text-sm hover:border-black/20"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <textarea
              value={cheerMessage}
              onChange={(e) => setCheerMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="항상 응원할게요!"
            />
          </div>

          {primaryArtist?.checkoutQuestion && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
              <p className="text-sm font-bold text-accent-strong">
                💬 {primaryArtist.name}의 질문
              </p>
              <p className="mt-0.5 text-sm text-ink">{primaryArtist.checkoutQuestion}</p>
              <input
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
                placeholder="답변을 입력해주세요 (선택)"
              />
            </div>
          )}

          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={listAsSupporter}
              onChange={(e) => setListAsSupporter(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-accent"
            />
            <span>
              🏆 내 닉네임을 {primaryArtist ? `${primaryArtist.name}의 ` : ""}
              서포터 페이지(디지털 명예의 전당)에 남길게요
            </span>
          </label>

          <p className="text-xs text-muted">
            프로토타입이므로 실제 결제는 이루어지지 않습니다. 버튼을 누르면 가상의 주문이 생성돼요.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
          >
            {formatWon(totalPrice)} 결제 완료하기
          </button>
        </form>

        <aside className="h-fit rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-sm font-bold text-ink">주문 요약</p>
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const product = getProductById(item.productId);
              return (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-ink">
                    {product?.title} {item.quantity > 1 ? `x${item.quantity}` : ""}
                    {product?.secretContent ? " 🔒" : ""}
                  </span>
                  <span className="text-muted">{formatWon(item.price * item.quantity)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 font-bold text-ink">
            <span>합계</span>
            <span>{formatWon(totalPrice)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
