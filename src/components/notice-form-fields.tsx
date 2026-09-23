"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { BROADCAST_MAX_MEDIA_COUNT, BROADCAST_TITLE_MAX_LENGTH } from "@/lib/broadcast-constants";
import type { NoticeVisibility } from "@/lib/broadcast-storage";

const VISIBILITY_OPTIONS: { value: NoticeVisibility; label: string }[] = [
  { value: "PUBLIC", label: "전체 공개" },
  { value: "SUPPORTER", label: "구매자 전용" },
  { value: "SUBSCRIBER", label: "구독자 전용" },
];

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent";

export interface NoticeImagePreview {
  id: string;
  previewUrl: string;
}

/**
 * Field-only building block (no <form>/submit button of its own) shared by the notice box's
 * owner composer and the /artist/[slug]/dashboard/notices page, so the title/body/image/
 * visibility/pin fields — and their validation — can never drift between the two places.
 */
export function NoticeFormFields({
  title,
  onTitleChange,
  message,
  onMessageChange,
  visibility,
  onVisibilityChange,
  pinned,
  onPinnedChange,
  images,
  onFilesSelected,
  onRemoveImage,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
  visibility: NoticeVisibility;
  onVisibilityChange: (v: NoticeVisibility) => void;
  pinned: boolean;
  onPinnedChange: (v: boolean) => void;
  images: NoticeImagePreview[];
  onFilesSelected: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm text-muted">제목</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value.slice(0, BROADCAST_TITLE_MAX_LENGTH))}
          placeholder="예: 이번 주 라이브 일정 안내"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">내용</label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
          placeholder="팬들에게 전할 소식을 적어주세요."
          className={FIELD_CLASS}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={visibility}
          onChange={(e) => onVisibilityChange(e.target.value as NoticeVisibility)}
          className={FIELD_CLASS}
        >
          {VISIBILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink">
          <input type="checkbox" checked={pinned} onChange={(e) => onPinnedChange(e.target.checked)} className="h-4 w-4" />
          📌 상단 고정
        </label>
      </div>

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= BROADCAST_MAX_MEDIA_COUNT}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-cream px-3 py-2.5 text-xs font-semibold text-muted transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🖼️ 이미지 추가하기 (최대 {BROADCAST_MAX_MEDIA_COUNT}장)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length > 0) onFilesSelected(files);
          }}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveImage(img.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
