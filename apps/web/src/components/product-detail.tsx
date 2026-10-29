"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Ban, Lock, Minus, Pause, Play, Plus } from "lucide-react";
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
import { formatDate, formatDuration, formatWon } from "@muraton/shared/format";
import { formatReleaseLabel } from "@muraton/shared/release-label";
import { CommentSection } from "./comment-section";
import { usePlayer } from "@/context/player-context";
import { albumPlayerTracks } from "@/lib/album-player-tracks";

export function ProductDetail({ product, artist }: { product: Product; artist: Artist }) {
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const player = usePlayer();
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
    addItem(product.id, price, isMerch ? quantity : 1, isMerch);
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

  const playerTracks = albumPlayerTracks(product, artist);
  const releaseDate = product.releaseDate ? formatDate(product.releaseDate) : null;
  const genreTags = (
    artist.genreTags && artist.genreTags.length > 0
      ? artist.genreTags
      : (product.genre ?? artist.genre ?? "").split(/[,·\s]+/)
  )
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);
  const totalSeconds = playerTracks.reduce((sum, t) => sum + (t.durationSec ?? 0), 0);
  const isThisReleasePlaying = player.current?.productId === product.id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,400px)_1fr] md:gap-12">
        <div className="mx-auto w-full max-w-sm md:max-w-none">
          <div className="overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(28,27,24,0.18)]">
            <CoverArt
              gradient={product.coverColor}
              label={product.title}
              type={product.type}
              imageUrl={product.imageUrl}
              hasSecret={Boolean(product.secretContent)}
              rounded="rounded-3xl"
              sizes="(max-width: 768px) 384px, 400px"
              priority
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <p className="text-xs font-bold tracking-[0.16em] text-muted">{formatReleaseLabel(product).toUpperCase()}</p>
          <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {product.title}
          </h1>
          <Link
            href={`/artists/${artist.slug}`}
            className="mt-2 self-start text-lg font-semibold text-ink underline-offset-4 hover:underline"
          >
            {artist.name}
          </Link>

          <p className="mt-3 text-sm text-muted tabular-nums">
            {[releaseDate && releaseDate !== "-" ? `${releaseDate} 발매` : null, playerTracks.length > 1 ? `${playerTracks.length}곡` : null, totalSeconds > 0 ? formatDuration(totalSeconds) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {genreTags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="장르">
              {genreTags.map((tag) => (
                <li key={tag} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink">
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {product.description && (
            <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-ink/85">{product.description}</p>
          )}

          {product.secretContent && (
            <p className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-lime/30 px-3 py-1.5 text-xs font-bold text-ink">
              <Lock aria-hidden className="size-3.5" />
              구매하면 시크릿 콘텐츠가 함께 열려요
            </p>
          )}

          {playerTracks.length > 0 && (
            <button
              type="button"
              onClick={() => (isThisReleasePlaying ? player.toggle() : player.playQueue(playerTracks, 0))}
              className="mt-6 inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-ink/20 px-5 text-sm font-bold text-ink transition hover:border-ink hover:bg-ink/5"
            >
              {isThisReleasePlaying && player.playing ? (
                <Pause aria-hidden className="size-4 fill-current" />
              ) : (
                <Play aria-hidden className="size-4 fill-current" />
              )}
              {isThisReleasePlaying && player.playing ? "일시정지" : product.type === "album" ? "전체 듣기" : "듣기"}
            </button>
          )}

          {isUnpublished ? (
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-sm font-bold text-muted">
              <Ban aria-hidden className="size-4 shrink-0" />
              판매가 종료된 음원이에요. 새로운 구매는 더 이상 할 수 없어요.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4 sm:p-5">
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
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="수량 줄이기"
                  className="grid size-11 place-items-center rounded-full border border-line text-ink transition hover:border-ink/30"
                >
                  <Minus aria-hidden className="size-4" />
                </button>
                <span className="w-8 text-center text-ink tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="수량 늘리기"
                  className="grid size-11 place-items-center rounded-full border border-line text-ink transition hover:border-ink/30"
                >
                  <Plus aria-hidden className="size-4" />
                </button>
              </div>
            </div>
          )}

          {!isUnpublished && (
            <>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={price === null}
                  className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-accent px-8 text-base font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isMusic ? buyLabel : `${formatWon((price ?? 0) * (isMerch ? quantity : 1))} 바로 구매`}
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={price === null}
                  className="inline-flex min-h-13 items-center justify-center rounded-full border border-line bg-surface px-6 text-sm font-bold text-ink transition hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {justAdded ? "담았어요" : "장바구니에 담기"}
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
          <AlbumTrackList product={product} artist={artist} />
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
