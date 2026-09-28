"use client";

import { useState } from "react";
import Link from "next/link";
import { CoverArt } from "./cover-art";
import { formatDate } from "@/lib/format";
import { usePlayer } from "@/context/player-context";
import { AddToPlaylistButton } from "@/components/add-to-playlist-button";

export interface CollectionItem {
  productId: string;
  title: string;
  type: "ALBUM" | "TRACK" | "MERCH" | "TICKET";
  releaseLabel?: string;
  status?: "PUBLISHED" | "UNPUBLISHED";
  coverColor: string;
  imageUrl?: string | null;
  artistName: string;
  artistSlug: string;
  purchasedAt: string;
  note: { message: string; updatedAt: string } | null;
  viaBundle?: boolean;
  shippingStatus?: "PAID" | "SHIPPING" | "DELIVERED";
  eventName?: string;
  venue?: string;
  eventAt?: string;
}

const SHIPPING_LABEL: Record<NonNullable<CollectionItem["shippingStatus"]>, string> = {
  PAID: "결제완료",
  SHIPPING: "배송중",
  DELIVERED: "수령완료",
};

export function CollectionItemCard({
  item,
  editable = false,
}: {
  item: CollectionItem;
  editable?: boolean;
}) {
  const [note, setNote] = useState(item.note?.message ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(item.note));
  const { playOne } = usePlayer();
  const isMusic = item.type === "ALBUM" || item.type === "TRACK";

  const handleSave = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/supporter-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, message: trimmed }),
      });
      if (res.ok) {
        setSaved(true);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3">
      <div className="relative">
        <Link href={`/products/${item.productId}`} className="block w-full">
          <CoverArt gradient={item.coverColor} label={item.title} type={item.type} imageUrl={item.imageUrl ?? undefined} />
        </Link>
        {isMusic && (
          <button
            type="button"
            onClick={() =>
              playOne({
                productId: item.productId,
                title: item.title,
                artistName: item.artistName,
                artistSlug: item.artistSlug,
                coverColor: item.coverColor,
                imageUrl: item.imageUrl,
              })
            }
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-md transition hover:bg-accent-strong"
            aria-label="재생"
          >
            ▶
          </button>
        )}
      </div>

      <div>
        <Link href={`/products/${item.productId}`} className="text-sm font-bold text-ink hover:underline">
          {item.title}
        </Link>
        {item.status === "UNPUBLISHED" && (
          <span
            title="아티스트가 판매를 종료한 음원이에요. 이미 구매하셨기 때문에 계속 들을 수 있어요."
            className="ml-1.5 inline-block rounded-full bg-cream px-2 py-0.5 align-middle text-[10px] font-bold text-muted"
          >
            판매 종료
          </span>
        )}
        {isMusic && item.releaseLabel && <p className="text-xs text-muted">{item.releaseLabel}</p>}
        <p className="text-xs text-muted">
          <Link href={`/artists/${item.artistSlug}`} className="hover:text-accent-strong">
            {item.artistName}
          </Link>
          {" · "}
          {item.type === "TICKET" && item.eventAt ? formatDate(item.eventAt) : formatDate(item.purchasedAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {item.viaBundle && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-strong">
            굿즈 포함
          </span>
        )}
        {item.shippingStatus && (
          <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-muted">
            {SHIPPING_LABEL[item.shippingStatus]}
          </span>
        )}
        {item.type === "TICKET" && (
          <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-muted">🎫 티켓</span>
        )}
      </div>

      {isMusic && <AddToPlaylistButton productId={item.productId} />}

      {editable ? (
        editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="이걸 산 이유를 짧게 남겨보세요"
              rows={2}
              className="w-full resize-none rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-accent px-2 py-1 text-xs font-bold text-white hover:bg-accent-strong disabled:opacity-60"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-line px-2 py-1 text-xs font-bold text-ink"
              >
                취소
              </button>
            </div>
          </div>
        ) : saved ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-cream px-2.5 py-1.5 text-left text-xs italic text-ink hover:bg-accent/10"
          >
            &ldquo;{note}&rdquo;
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-dashed border-line px-2.5 py-1.5 text-left text-xs text-muted hover:border-accent/40 hover:text-accent-strong"
          >
            + 이걸 산 이유 남기기
          </button>
        )
      ) : item.note ? (
        <p className="rounded-lg bg-cream px-2.5 py-1.5 text-xs italic text-ink">&ldquo;{item.note.message}&rdquo;</p>
      ) : null}
    </div>
  );
}
