"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useCatalog } from "@/lib/use-catalog";
import { formatWon } from "@muraton/shared/format";
import { createOrder } from "@/lib/orders-client";
import type { CartItem, Order } from "@muraton/shared/types";

const QUICK_EMOJIS = ["❤️", "🙏", "🔥", "✨"];

function generateOrderId() {
  return `MRT-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * "바로 구매" sends `?product=<id>&price=<won>&quantity=<n>`: checkout then covers only that
 * item and leaves the cart alone. Anything malformed falls back to the normal cart checkout.
 */
function parseBuyNow(query: Record<string, string | string[] | undefined>): CartItem | null {
  const productId = typeof query.product === "string" ? query.product : "";
  const price = Number(query.price);
  const quantity = Number(query.quantity ?? 1);
  if (!productId || !Number.isInteger(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1) {
    return null;
  }
  return { productId, price, quantity };
}

export default function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const buyNowItem = parseBuyNow(use(searchParams));
  const cart = useCart();
  const items = buyNowItem ? [buyNowItem] : cart.items;
  const totalPrice = buyNowItem ? buyNowItem.price * buyNowItem.quantity : cart.totalPrice;
  const catalog = useCatalog();
  const router = useRouter();
  const { isLoggedIn, loading: authLoading, nickname, email } = useAuth();
  const [cheerMessage, setCheerMessage] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [listAsSupporter, setListAsSupporter] = useState(true);
  const [agreedToCopyright, setAgreedToCopyright] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/login?message=" + encodeURIComponent("구매하려면 로그인이 필요해요."));
    }
  }, [authLoading, isLoggedIn, router]);

  if (authLoading || !isLoggedIn) return null;

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

  if (!catalog) return null;

  const firstProduct = catalog.getProductById(items[0].productId);
  const primaryArtist = firstProduct ? catalog.getArtistById(firstProduct.artistId) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const orderItems = items.map((item) => ({
      productId: item.productId,
      artistId: catalog.getProductById(item.productId)?.artistId ?? "",
      price: item.price,
      quantity: item.quantity,
    }));

    const order: Order = {
      id: generateOrderId(),
      name: nickname ?? "",
      email: email ?? "",
      cheerMessage,
      promptQuestion: primaryArtist?.checkoutQuestion,
      promptAnswer: primaryArtist?.checkoutQuestion ? promptAnswer : undefined,
      listAsSupporter,
      primaryArtistId: primaryArtist?.id,
      items: items.map((item) => {
        const product = catalog.getProductById(item.productId);
        const artist = product ? catalog.getArtistById(product.artistId) : undefined;
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

    await createOrder({
      cheerMessage,
      promptQuestion: order.promptQuestion,
      promptAnswer: order.promptAnswer,
      listAsSupporter,
      primaryArtistId: primaryArtist?.id,
      total: totalPrice,
      items: orderItems,
    });

    window.sessionStorage.setItem("muraton-last-order", JSON.stringify(order));
    if (!buyNowItem) cart.clearCart();
    router.push("/checkout/success");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-black text-ink">결제하기</h1>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-black text-white">
              {(nickname ?? "?").slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{nickname}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
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

          <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3">
            <p className="text-sm font-bold text-amber-800">
              ⓒ 음원 재판매 및 무단 활용을 금지합니다. 모든 저작권은 아티스트에게 있습니다.
            </p>
            <label className="mt-2 flex items-start gap-2 text-sm text-ink">
              <input
                required
                type="checkbox"
                checked={agreedToCopyright}
                onChange={(e) => setAgreedToCopyright(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span>위 저작권 안내 내용에 동의합니다. (필수)</span>
            </label>
          </div>

          <p className="text-xs text-muted">
            프로토타입이므로 실제 결제는 이루어지지 않습니다. 버튼을 누르면 주문 내역이 저장돼요.
          </p>

          <button
            type="submit"
            disabled={submitting || !agreedToCopyright}
            className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
          >
            {formatWon(totalPrice)} 결제 완료하기
          </button>
        </form>

        <aside className="h-fit rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-sm font-bold text-ink">주문 요약</p>
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const product = catalog.getProductById(item.productId);
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
