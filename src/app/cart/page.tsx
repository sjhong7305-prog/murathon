"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useCatalog } from "@/lib/use-catalog";
import { formatWon } from "@/lib/format";
import { CoverArt } from "@/components/cover-art";

export default function CartPage() {
  const { items, removeItem, updatePrice, updateQuantity, totalPrice } = useCart();
  const catalog = useCatalog();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">장바구니가 비어있어요</h1>
        <p className="mt-2 text-muted">마음에 드는 아티스트의 음원이나 굿즈를 담아보세요.</p>
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-black text-ink">장바구니</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const product = catalog.getProductById(item.productId);
          if (!product) return null;
          const artist = catalog.getArtistById(product.artistId);
          const isMerch = product.type === "merch";

          return (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-line bg-surface p-4"
            >
              <div className="w-20 shrink-0">
                <CoverArt
                  gradient={product.coverColor}
                  label=""
                  type={product.type}
                  imageUrl={product.imageUrl}
                  sizes="80px"
                />
              </div>

              <div className="flex-1">
                <p className="text-xs text-accent-strong">{artist?.name}</p>
                <p className="font-bold text-ink">{product.title}</p>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted">
                    가격
                    <input
                      type="number"
                      min={product.minPrice}
                      step={100}
                      value={item.price}
                      onChange={(e) =>
                        updatePrice(
                          item.productId,
                          Math.max(product.minPrice, Number(e.target.value) || 0)
                        )
                      }
                      className="w-24 rounded-lg border border-line bg-surface px-2 py-1 text-ink outline-none focus:border-accent"
                    />
                    원
                  </label>

                  {isMerch && (
                    <label className="flex items-center gap-2 text-sm text-muted">
                      수량
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
                        className="w-16 rounded-lg border border-line bg-surface px-2 py-1 text-ink outline-none focus:border-accent"
                      />
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-muted hover:text-rose-600"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <p className="shrink-0 self-center font-bold text-ink">
                {formatWon(item.price * item.quantity)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <div>
          <p className="text-sm text-muted">총 결제 금액</p>
          <p className="text-2xl font-black text-ink">{formatWon(totalPrice)}</p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full bg-accent px-8 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          결제하기
        </Link>
      </div>
    </div>
  );
}
