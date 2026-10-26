"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, GripVertical, ImagePlus } from "lucide-react";
import { CATEGORY_OPTIONS, VISIBILITY_OPTIONS } from "@/lib/artist-feed-labels";
import {
  FEED_MAX_MEDIA_COUNT,
  MAX_FEED_IMAGE_BYTES,
  MAX_FEED_VIDEO_BYTES,
  FEED_VIDEO_ALLOWED_MIME,
} from "@/lib/artist-feed-constants";
import type { ArtistPostCategory, ArtistPostVisibility } from "@muraton/db";
import type { FeedPostView } from "@/lib/artist-feed";

interface PendingFile {
  id: string;
  file: File;
  kind: "image" | "video";
  previewUrl: string;
}

interface MediaResult {
  type: "IMAGE" | "VIDEO";
  url: string;
  width?: number;
  height?: number;
  durationSec?: number;
}

function xhrRequest(
  method: string,
  url: string,
  body: FormData | File,
  headers: Record<string, string> | undefined,
  onProgress: (pct: number) => void
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (headers) {
      for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null);
        } catch {
          resolve(null);
        }
      } else {
        let message = `업로드에 실패했어요. (${xhr.status})`;
        try {
          const data = JSON.parse(xhr.responseText);
          if (data?.error) message = data.error;
        } catch {
          // ignore parse errors, use default message
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("업로드 중 오류가 발생했어요."));
    xhr.send(body);
  });
}

function readVideoMetadata(file: File): Promise<{ width: number; height: number; durationSec: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight, durationSec: Math.round(video.duration) });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => reject(new Error("영상 정보를 읽을 수 없어요."));
    video.src = URL.createObjectURL(file);
  });
}

const FIELD_CLASS =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent";

/** Owner-only collapsed-by-default composer. Sits at the top of an artist's feed list. */
export function FeedComposer({
  artistId,
  authorAvatarUrl,
  onPosted,
}: {
  artistId: string;
  authorAvatarUrl?: string | null;
  onPosted: (post: FeedPostView) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState<ArtistPostCategory>("ETC");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<ArtistPostVisibility>("PUBLIC");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (pendingFiles.length + files.length > FEED_MAX_MEDIA_COUNT) {
      setError(`미디어는 최대 ${FEED_MAX_MEDIA_COUNT}개까지 첨부할 수 있어요.`);
      return;
    }
    const next: PendingFile[] = [];
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (isImage && file.size > MAX_FEED_IMAGE_BYTES) {
        setError(`"${file.name}"은 이미지 10MB 제한을 초과해요.`);
        return;
      }
      if (isVideo && file.size > MAX_FEED_VIDEO_BYTES) {
        setError(`"${file.name}"은 영상 500MB 제한을 초과해요.`);
        return;
      }
      if (isVideo && !FEED_VIDEO_ALLOWED_MIME.includes(file.type)) {
        setError(`"${file.name}"은 지원하지 않는 영상 형식이에요. (mp4/webm/mov만 가능)`);
        return;
      }
      if (!isImage && !isVideo) {
        setError(`"${file.name}"은 이미지 또는 영상 파일이 아니에요.`);
        return;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        kind: isImage ? "image" : "video",
        previewUrl: URL.createObjectURL(file),
      });
    }
    setError(null);
    setPendingFiles((prev) => [...prev, ...next]);
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setPendingFiles((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(targetIndex, 0, moved);
      return arr;
    });
    setDragIndex(null);
  };

  const uploadOne = async (pf: PendingFile): Promise<MediaResult> => {
    if (pf.kind === "image") {
      const formData = new FormData();
      formData.append("image", pf.file);
      const data = (await xhrRequest("POST", `/api/artists/${artistId}/feed/media/image`, formData, undefined, (pct) =>
        setProgress((prev) => ({ ...prev, [pf.id]: pct }))
      )) as { url: string; width: number; height: number };
      return { type: "IMAGE", url: data.url, width: data.width, height: data.height };
    }

    const meta = await readVideoMetadata(pf.file).catch(() => ({ width: 0, height: 0, durationSec: 0 }));
    const presignRes = await fetch(`/api/artists/${artistId}/feed/media/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: pf.file.name, contentType: pf.file.type }),
    });
    const presignData = await presignRes.json();
    if (!presignRes.ok) throw new Error(presignData.error ?? "영상 업로드 준비에 실패했어요.");

    await xhrRequest("PUT", presignData.uploadUrl, pf.file, presignData.headers, (pct) =>
      setProgress((prev) => ({ ...prev, [pf.id]: pct }))
    );

    return { type: "VIDEO", url: presignData.publicUrl, ...meta };
  };

  const collapse = () => {
    pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setContent("");
    setCategory("ETC");
    setVisibility("PUBLIC");
    setPendingFiles([]);
    setProgress({});
    setError(null);
    setExpanded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const media: MediaResult[] = [];
      for (const pf of pendingFiles) {
        media.push(await uploadOne(pf));
      }

      const res = await fetch(`/api/artists/${artistId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          content: content.trim(),
          visibility,
          media,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "게시하지 못했어요.");
        return;
      }

      // POST only returns the new id — pull the real, server-shaped post back so the
      // card we prepend is identical to what a refetch would render (never fabricated locally).
      const pageRes = await fetch(`/api/artists/${artistId}/feed?limit=1`);
      const page = pageRes.ok ? await pageRes.json() : null;
      const created: FeedPostView | undefined = page?.posts?.find((p: FeedPostView) => p.id === data.id) ?? page?.posts?.[0];

      collapse();
      if (created) onPosted(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시하지 못했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <div className="w-full border-b border-line bg-surface px-3 py-3 sm:mb-6 sm:rounded-2xl sm:border">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-cream">
            {authorAvatarUrl && (
              <Image src={authorAvatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
            )}
          </span>
          <span className="flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-sm text-muted">
            팬들에게 소식을 전해보세요
          </span>
          <ImagePlus size={20} className="shrink-0 text-muted" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 border-b border-line bg-surface p-4 sm:mb-6 sm:rounded-2xl sm:border"
    >
      <div className="flex items-center gap-2.5">
        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-cream">
          {authorAvatarUrl && (
            <Image src={authorAvatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
          )}
        </span>
        <p className="text-sm font-bold text-ink">새 피드 게시물</p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-cream px-3 py-3 text-xs font-semibold text-muted transition hover:border-accent/50"
        >
          🎥🖼️ 이미지 · 영상 추가하기 (최대 {FEED_MAX_MEDIA_COUNT}개)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
      </div>

      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingFiles.map((pf, i) => (
            <div
              key={pf.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="relative h-20 w-20 shrink-0 cursor-grab overflow-hidden rounded-lg border border-line bg-cream"
            >
              {pf.kind === "video" ? (
                <video src={pf.previewUrl} className="h-full w-full object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pf.previewUrl} alt="" className="h-full w-full object-cover" />
              )}
              <span className="absolute left-1 top-1 rounded bg-black/50 p-0.5 text-white">
                <GripVertical size={11} />
              </span>
              <button
                type="button"
                onClick={() => removePendingFile(pf.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X size={11} />
              </button>
              {submitting && progress[pf.id] !== undefined && progress[pf.id] < 100 && (
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
                  <div className="h-full bg-accent transition-all" style={{ width: `${progress[pf.id]}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value as ArtistPostCategory)} className={FIELD_CLASS}>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value as ArtistPostVisibility)} className={FIELD_CLASS}>
          {VISIBILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="어떤 이야기를 공유하고 싶으세요?"
        className={FIELD_CLASS}
      />

      {error && (
        <p className="text-sm font-semibold text-rose-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={collapse}
          disabled={submitting}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "게시 중..." : "게시하기"}
        </button>
      </div>
    </form>
  );
}
