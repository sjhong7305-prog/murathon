"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Artist, Product } from "@muraton/shared/types";
import { CoverArt } from "./cover-art";
import { PriceSelector } from "./price-selector";
import { MusicPriceSelector } from "./music-price-selector";
import { AlbumTrackList } from "./album-track-list";
import { AlbumIntro } from "./album-intro";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatWon } from "@muraton/shared/format";
import { formatReleaseLabel } from "@muraton/shared/release-label";
import { CommentSection } from "./comment-section";

export function ProductDetail({ product, artist }: { product: Product; artist: Artist }) {
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const isMerch = product.type === "merch";
  const isMusic = product.type === "album" || product.type === "track";
  const isUnpublished = product.status === "unpublished";
  const [price, setPrice] = useState<number | null>(isMusic ? null : product.suggestedPrice);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const requireLogin = () => {
    if (isLoggedIn) return true;
    router.push("/login?message=" + encodeURIComponent("구매하려면 로그인이 필요해요."));
    return false;
  };

  const handleAdd = () => {
    if (price === null) return;
    if (!requireLogin()) return;
    addItem(product.id, price, isMerch ? quantity : 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  // Goes straight to checkout with just this item; the cart is left untouched.
  const handleBuyNow = () => {
    if (price === null) return;
    if (!requireLogin()) return;
    const params = new URLSearchParams({
      product: product.id,
      price: String(price),
      quantity: String(isMerch ? quantity : 1),
    });
    router.push(`/checkout?${params}`);
  };

  const buyLabel =
    price === null ? "금액을 입력해 주세요" : price === 0 ? "무료로 받기" : `${formatWon(price)} 바로 구매`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[320px_1fr]">
        <CoverArt
          gradient={product.coverColor}
          label={product.title}
          type={product.type}
          imageUrl={product.imageUrl}
          hasSecret={Boolean(product.secretContent)}
          sizes="(max-width: 640px) 100vw, 320px"
          priority
        />

        <div>
          <Link href={`/artists/${artist.slug}`} className="text-sm font-semibold text-accent-strong hover:underline">
            {artist.name}
          </Link>
          <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{product.title}</h1>
          <p className="mt-1 text-sm text-muted">{formatReleaseLabel(product)}</p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink">
            {product.description}
          </p>

          {product.secretContent && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-700">
              🔒 구매하면 시크릿 콘텐츠가 함께 열려요
            </p>
          )}

          {isUnpublished ? (
            <div className="mt-6 rounded-xl border border-line bg-cream p-4 text-sm font-bold text-muted">
              🚫 판매가 종료된 음원이에요. 새로운 구매는 더 이상 할 수 없어요.
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-line bg-surface p-4">
              <p className="mb-3 text-sm font-bold text-ink">가격을 직접 정해주세요</p>
              {isMusic ? (
                <MusicPriceSelector
                  minPrice={product.minPrice}
                  suggestedPrice={product.suggestedPrice}
                  onChange={setPrice}
                />
              ) : (
                <PriceSelector
                  minPrice={product.minPrice}
                  suggestedPrice={product.suggestedPrice}
                  onChange={setPrice}
                />
              )}
            </div>
          )}

          {!isUnpublished && isMerch && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-muted">수량</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-full border border-line text-ink hover:border-black/20"
                >
                  −
                </button>
                <span className="w-6 text-center text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-8 w-8 rounded-full border border-line text-ink hover:border-black/20"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {!isUnpublished && (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={price === null}
                  className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isMusic ? buyLabel : `${formatWon((price ?? 0) * (isMerch ? quantity : 1))} 바로 구매`}
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={price === null}
                  className="rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {justAdded ? "담았어요 ✓" : "장바구니에 담기"}
                </button>
              </div>

              <p className="mt-4 text-xs text-muted">
                결제 금액의 100%가 {artist.name}에게 직접 전달됩니다. 중간 유통사 수수료가 없습니다.
              </p>
            </>
          )}
        </div>
      </div>

      {(product.type === "album" || product.type === "track") && (
        <>
          <AlbumTrackList
            productId={product.id}
            productType={product.type}
            productTitle={product.title}
            productDurationSec={product.durationSec}
            tracks={product.tracks}
          />
          <AlbumIntro
            longDescription={product.longDescription}
            releaseDate={product.releaseDate}
            genre={artist.genre}
            credits={product.credits}
          />
        </>
      )}

      <CommentSection productId={product.id} />
    </div>
  );
}
