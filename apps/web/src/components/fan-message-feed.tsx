"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatWon, formatRelativeTime } from "@muraton/shared/format";
import { CoverArt } from "@/components/cover-art";
import type { FanMessageView } from "@/lib/fan-messages";

export function FanMessageFeed({ artistId }: { artistId: string | null }) {
  const [messages, setMessages] = useState<FanMessageView[] | null>(null);

  useEffect(() => {
    if (!artistId) return;
    fetch(`/api/artists/${artistId}/fan-messages`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [artistId]);

  if (messages === null) return null;

  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
        아직 받은 메시지가 없어요. 팬이 구매하면서 응원 메시지를 남기면 여기에 표시돼요.
      </p>
    );
  }

  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {messages.map((msg) => {
        const reviewText = msg.cheerMessage ? `“${msg.cheerMessage}”` : null;
        const qaText = msg.promptQuestion ? `Q. ${msg.promptQuestion} → ${msg.promptAnswer}` : null;

        return (
          <Link
            key={msg.orderId}
            href={`/products/${msg.product.id}`}
            className="flex items-stretch gap-3 px-3 py-2.5 text-xs transition hover:bg-black/[0.04]"
          >
            <div className="w-10 shrink-0 self-center">
              <CoverArt
                gradient={msg.product.coverColor}
                label={msg.product.title}
                imageUrl={msg.product.imageUrl ?? undefined}
                hideLabel
                rounded="rounded-md"
                sizes="40px"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 font-bold text-ink">{msg.buyerNickname}</span>
                <span className="truncate text-muted">· {msg.product.title}</span>
              </div>

              {reviewText && (
                <p className="truncate text-[13px] font-medium text-ink" title={reviewText}>
                  {reviewText}
                </p>
              )}
              {qaText && (
                <p className="truncate text-xs text-muted" title={qaText}>
                  {qaText}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end justify-center gap-1.5">
              <span className="font-bold text-ink">{formatWon(msg.paidPrice)}</span>
              <span className="text-muted">{formatRelativeTime(msg.createdAt)}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
