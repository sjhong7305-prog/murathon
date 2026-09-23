"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pin } from "lucide-react";
import { NoticeFormFields, type NoticeImagePreview } from "@/components/notice-form-fields";
import {
  addBroadcast,
  getBroadcasts,
  type Broadcast,
  type BroadcastTarget,
  type NoticeVisibility,
} from "@/lib/broadcast-storage";
import { BROADCAST_MAX_MEDIA_COUNT, MAX_BROADCAST_IMAGE_BYTES } from "@/lib/broadcast-constants";
import { formatDateTime } from "@/lib/format";

const VISIBILITY_LABEL: Record<NoticeVisibility, string> = {
  PUBLIC: "전체 공개",
  SUPPORTER: "구매자 전용",
  SUBSCRIBER: "구독자 전용",
};

const REGIONS = ["서울", "인천", "제주", "부산"];
const AMOUNT_TIERS = ["5,000원 이상", "10,000원 이상", "30,000원 이상"];

const TARGET_LABEL: Record<BroadcastTarget, string> = {
  all: "전체 팔로워",
  amount: "구매 금액별",
  region: "지역별",
};

const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];

interface PendingBroadcastImage extends NoticeImagePreview {
  file: File;
}

export function NoticeComposerPanel({ artistId }: { artistId: string }) {
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastVisibility, setBroadcastVisibility] = useState<NoticeVisibility>("PUBLIC");
  const [broadcastPinned, setBroadcastPinned] = useState(false);
  const [target, setTarget] = useState<BroadcastTarget>("all");
  const [amountTier, setAmountTier] = useState(AMOUNT_TIERS[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [broadcastImages, setBroadcastImages] = useState<PendingBroadcastImage[]>([]);
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  useEffect(() => {
    getBroadcasts(artistId).then(setBroadcasts);
  }, [artistId]);

  const handleBroadcastFilesSelected = (files: File[]) => {
    if (broadcastImages.length + files.length > BROADCAST_MAX_MEDIA_COUNT) {
      setBroadcastError(`이미지는 최대 ${BROADCAST_MAX_MEDIA_COUNT}장까지 첨부할 수 있어요.`);
      return;
    }
    const next: PendingBroadcastImage[] = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
        setBroadcastError(`"${file.name}"은 jpg, png, webp 파일만 첨부할 수 있어요.`);
        return;
      }
      if (file.size > MAX_BROADCAST_IMAGE_BYTES) {
        setBroadcastError(`"${file.name}"은 이미지 10MB 제한을 초과해요.`);
        return;
      }
      next.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) });
    }
    setBroadcastError(null);
    setBroadcastImages((prev) => [...prev, ...next]);
  };

  const removeBroadcastImage = (id: string) => {
    setBroadcastImages((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = broadcastTitle.trim();
    const trimmed = broadcastMessage.trim();
    if (!trimmedTitle || !trimmed) return;
    setBroadcastSubmitting(true);
    setBroadcastError(null);
    try {
      const media: { url: string; width?: number; height?: number }[] = [];
      for (const pending of broadcastImages) {
        const formData = new FormData();
        formData.append("image", pending.file);
        const res = await fetch(`/api/artists/${artistId}/broadcasts/media/image`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "이미지 업로드에 실패했어요.");
        media.push({ url: data.url, width: data.width, height: data.height });
      }

      await addBroadcast(artistId, {
        title: trimmedTitle,
        message: trimmed,
        target,
        targetDetail: target === "amount" ? amountTier : target === "region" ? region : undefined,
        visibility: broadcastVisibility,
        pinned: broadcastPinned,
        media,
      });
      // Refetch rather than splice locally — pinning this one may have unpinned another row
      // server-side, and a local splice would leave that row showing stale pinned:true.
      await getBroadcasts(artistId).then(setBroadcasts);
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastVisibility("PUBLIC");
      setBroadcastPinned(false);
      broadcastImages.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setBroadcastImages([]);
    } catch (err) {
      setBroadcastError(err instanceof Error ? err.message : "공지를 보내지 못했어요.");
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSendBroadcast} className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-bold text-ink">📢 팬에게 공지 보내기</p>
        <div className="mt-3">
          <NoticeFormFields
            title={broadcastTitle}
            onTitleChange={setBroadcastTitle}
            message={broadcastMessage}
            onMessageChange={setBroadcastMessage}
            visibility={broadcastVisibility}
            onVisibilityChange={setBroadcastVisibility}
            pinned={broadcastPinned}
            onPinnedChange={setBroadcastPinned}
            images={broadcastImages}
            onFilesSelected={handleBroadcastFilesSelected}
            onRemoveImage={removeBroadcastImage}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted">대상</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as BroadcastTarget)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="all">전체 팔로워</option>
            <option value="amount">구매 금액별</option>
            <option value="region">지역별</option>
          </select>

          {target === "amount" && (
            <select
              value={amountTier}
              onChange={(e) => setAmountTier(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              {AMOUNT_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          )}

          {target === "region" && (
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>

        {broadcastError && (
          <p className="mt-3 text-sm font-semibold text-rose-600" role="alert">
            {broadcastError}
          </p>
        )}

        <button
          type="submit"
          disabled={broadcastSubmitting || !broadcastTitle.trim() || !broadcastMessage.trim()}
          className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {broadcastSubmitting ? "보내는 중..." : "공지 보내기"}
        </button>
      </form>

      <div>
        <p className="mb-2 text-sm font-bold text-ink">보낸 공지 ({broadcasts.length})</p>
        {broadcasts.length === 0 ? (
          <p className="text-sm text-muted">아직 보낸 공지가 없어요.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {broadcasts.map((b) => (
              <div key={b.id} className="rounded-lg border border-line bg-surface p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {b.pinned && (
                    <span className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold text-ink">
                      <Pin size={10} /> 고정
                    </span>
                  )}
                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold text-ink">
                    {VISIBILITY_LABEL[b.visibility]}
                  </span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-strong">
                    {TARGET_LABEL[b.target]}
                    {b.targetDetail ? ` · ${b.targetDetail}` : ""}
                  </span>
                  <span className="text-xs font-semibold text-muted">도달 {b.reachCount.toLocaleString("ko-KR")}명</span>
                  <span className="ml-auto text-xs text-muted">{formatDateTime(b.sentAt)}</span>
                </div>
                {b.title && <p className="mt-1.5 text-sm font-bold text-ink">{b.title}</p>}
                <p className="mt-1 whitespace-pre-wrap text-ink">{b.message}</p>
                {b.media.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {b.media.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setViewerImage(m.url)}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream"
                      >
                        <Image src={m.url} alt="" fill sizes="64px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {viewerImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setViewerImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewerImage} alt="" className="max-h-[85vh] max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
