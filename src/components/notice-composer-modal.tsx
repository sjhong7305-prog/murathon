"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { NoticeFormFields, type NoticeImagePreview } from "./notice-form-fields";
import { addBroadcast, updateBroadcast, type NoticeVisibility } from "@/lib/broadcast-storage";
import { BROADCAST_MAX_MEDIA_COUNT, MAX_BROADCAST_IMAGE_BYTES } from "@/lib/broadcast-constants";

const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];

interface PendingImage extends NoticeImagePreview {
  file: File;
}

export interface NoticeEditTarget {
  id: string;
  title: string;
  message: string;
  visibility: NoticeVisibility;
  pinned: boolean;
}

/** Create/edit modal for a notice — image upload only offered when creating (media isn't editable, same rule as the feed). */
export function NoticeComposerModal({
  artistId,
  editTarget,
  onClose,
  onSaved,
}: {
  artistId: string;
  editTarget?: NoticeEditTarget | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(editTarget);
  const [title, setTitle] = useState(editTarget?.title ?? "");
  const [message, setMessage] = useState(editTarget?.message ?? "");
  const [visibility, setVisibility] = useState<NoticeVisibility>(editTarget?.visibility ?? "PUBLIC");
  const [pinned, setPinned] = useState(editTarget?.pinned ?? false);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (images.length + files.length > BROADCAST_MAX_MEDIA_COUNT) {
      setError(`이미지는 최대 ${BROADCAST_MAX_MEDIA_COUNT}장까지 첨부할 수 있어요.`);
      return;
    }
    const next: PendingImage[] = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
        setError(`"${file.name}"은 jpg, png, webp 파일만 첨부할 수 있어요.`);
        return;
      }
      if (file.size > MAX_BROADCAST_IMAGE_BYTES) {
        setError(`"${file.name}"은 이미지 10MB 제한을 초과해요.`);
        return;
      }
      next.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) });
    }
    setError(null);
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && editTarget) {
        await updateBroadcast(artistId, editTarget.id, {
          title: title.trim(),
          message: message.trim(),
          visibility,
          pinned,
        });
      } else {
        const media: { url: string; width?: number; height?: number }[] = [];
        for (const img of images) {
          const formData = new FormData();
          formData.append("image", img.file);
          const res = await fetch(`/api/artists/${artistId}/broadcasts/media/image`, { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "이미지 업로드에 실패했어요.");
          media.push({ url: data.url, width: data.width, height: data.height });
        }
        await addBroadcast(artistId, {
          title: title.trim(),
          message: message.trim(),
          target: "all",
          targetDetail: undefined,
          visibility,
          pinned,
          media,
        });
      }
      images.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "공지를 저장하지 못했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-line bg-surface"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-bold text-ink">{isEdit ? "공지 수정" : "📢 새 공지 작성"}</p>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <NoticeFormFields
            title={title}
            onTitleChange={setTitle}
            message={message}
            onMessageChange={setMessage}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            pinned={pinned}
            onPinnedChange={setPinned}
            images={isEdit ? [] : images}
            onFilesSelected={handleFilesSelected}
            onRemoveImage={removeImage}
          />
          {isEdit && (
            <p className="mt-2 text-xs text-muted">이미지는 수정할 수 없어요. 이미지를 바꾸려면 삭제 후 새로 작성해주세요.</p>
          )}
          {error && (
            <p className="mt-3 text-sm font-semibold text-rose-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-line p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-full border border-line px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !message.trim()}
            className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "저장 중..." : isEdit ? "저장" : "게시하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
