"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { mockOrders, type MockOrder } from "@/lib/mock-orders";
import { getProductById, getArtistById } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { CoverArt } from "@/components/cover-art";
import { ReactionButtons } from "@/components/reaction-buttons";

const VISIBLE_COUNT = 5;
const MAX_ITEMS = 6;
const TICK_MS = 7000;

export function FanMessageFeed() {
  const [feed, setFeed] = useState<MockOrder[]>(() => mockOrders.slice(0, VISIBLE_COUNT));
  const poolIndex = useRef(VISIBLE_COUNT);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = mockOrders[poolIndex.current % mockOrders.length];
      poolIndex.current += 1;
      const withUniqueId = { ...next, id: `${next.id}-${Date.now()}` };
      setFeed((prev) => [withUniqueId, ...prev].slice(0, MAX_ITEMS));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      <AnimatePresence initial={false}>
        {feed.map((order) => {
          const product = getProductById(order.productId);
          const artist = product ? getArtistById(product.artistId) : undefined;
          const hasMessage = Boolean(order.cheerMessage || order.promptAnswer);
          const messageText = [
            order.cheerMessage ? `“${order.cheerMessage}”` : null,
            order.promptQuestion ? `Q. ${order.promptQuestion} → ${order.promptAnswer}` : null,
          ]
            .filter(Boolean)
            .join("  ·  ");

          return (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            >
              <Link
                href={product ? `/products/${product.id}` : "#"}
                className="flex items-center gap-3 px-3 py-2 text-xs transition hover:bg-black/[0.04]"
              >
                <div className="w-10 shrink-0">
                  <CoverArt
                    gradient={product?.coverColor ?? "from-neutral-700 to-neutral-800"}
                    label={product?.title ?? ""}
                    imageUrl={product?.imageUrl}
                    hideLabel
                    rounded="rounded-md"
                    sizes="40px"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="shrink-0 font-bold text-ink">{order.buyerNickname}</span>
                      <span className="truncate text-muted">
                        · {artist?.name} · {product?.title}
                      </span>
                      {order.isSupporter && (
                        <span
                          title="서포터 등록"
                          className="shrink-0 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent-strong"
                        >
                          🏆
                        </span>
                      )}
                      {product?.secretContent && (
                        <span
                          title="시크릿 해금됨"
                          className="shrink-0 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700"
                        >
                          🔒
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 font-bold text-ink">{formatWon(order.price)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p
                      className="min-w-0 flex-1 truncate text-muted"
                      title={hasMessage ? messageText : undefined}
                    >
                      {hasMessage ? messageText : "—"}
                    </p>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ReactionButtons
                        initialHeart={order.reactions.heart}
                        initialPray={order.reactions.pray}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
