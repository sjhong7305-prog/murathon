"use client";

import { Image as ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Pin, Plus } from "lucide-react";
import { formatRelativeTime } from "@muraton/shared/format";
import { deleteBroadcast, updateBroadcast } from "@/lib/broadcast-storage";
import { NoticeComposerModal, type NoticeEditTarget } from "./notice-composer-modal";
import type { NoticeListItemView } from "@/lib/artist-notices";

function NoticeItemMenu({
  onEdit,
  onDelete,
  onTogglePin,
  pinned,
  busy,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  pinned: boolean;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        aria-label="공지 메뉴"
        className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-ink"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-10 w-32 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              onEdit();
            }}
            className="block w-full px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-cream"
          >
            수정
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              onTogglePin();
            }}
            className="block w-full px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-cream disabled:opacity-60"
          >
            {pinned ? "고정 해제" : "상단 고정"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              onDelete();
            }}
            className="block w-full px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-cream disabled:opacity-60"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

export function NoticeBox({
  artistId,
  artistSlug,
  isOwner,
  initialNotices,
}: {
  artistId: string;
  artistSlug: string;
  isOwner: boolean;
  initialNotices: NoticeListItemView[];
}) {
  const [notices, setNotices] = useState(initialNotices);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NoticeEditTarget | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refetch = async () => {
    const res = await fetch(`/api/artists/${artistId}/notices?box=1&limit=3`);
    if (res.ok) {
      const data = await res.json();
      setNotices(data.notices);
    }
  };

  const openEdit = async (noticeId: string) => {
    const res = await fetch(`/api/artists/${artistId}/notices/${noticeId}`);
    if (!res.ok) return;
    const notice = await res.json();
    setEditTarget({
      id: notice.id,
      title: notice.title,
      message: notice.message,
      visibility: notice.visibility,
      pinned: notice.pinned,
    });
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm("이 공지를 삭제할까요?")) return;
    setBusyId(noticeId);
    try {
      await deleteBroadcast(artistId, noticeId);
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePin = async (noticeId: string, nextPinned: boolean) => {
    setBusyId(noticeId);
    try {
      await updateBroadcast(artistId, noticeId, { pinned: nextPinned });
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  if (notices.length === 0 && !isOwner) return null;

  const boxStyle = {
    borderColor: "color-mix(in srgb, var(--artist-accent, var(--accent)) 30%, transparent)",
    backgroundColor: "var(--artist-card, var(--surface))",
  };

  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border p-6 text-center" style={boxStyle}>
        <p className="text-sm font-bold" style={{ color: "var(--artist-card-text, var(--ink))" }}>
          첫 공지를 작성해보세요
        </p>
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="rounded-full px-5 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: "var(--artist-accent, var(--accent))" }}
        >
          공지 작성하기
        </button>
        {composerOpen && (
          <NoticeComposerModal
            artistId={artistId}
            onClose={() => setComposerOpen(false)}
            onSaved={() => {
              setComposerOpen(false);
              refetch();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border" style={boxStyle}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--artist-text, var(--ink)) 12%, transparent)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--artist-accent, var(--accent))" }}>
          공지
        </p>
        {isOwner && (
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition"
            style={{ borderColor: "color-mix(in srgb, var(--artist-text, var(--ink)) 20%, transparent)", color: "var(--artist-card-text, var(--ink))" }}
          >
            <Plus size={12} /> 공지 작성
          </button>
        )}
        <Link
          href={`/artists/${artistSlug}/notices`}
          className="ml-auto shrink-0 text-xs font-semibold"
          style={{ color: "var(--artist-accent, var(--accent))" }}
        >
          전체 보기 →
        </Link>
      </div>

      <ul className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--artist-text, var(--ink)) 8%, transparent)" }}>
        {notices.map((n) => (
          <li key={n.id} className="flex items-center gap-2 px-4 py-2.5">
            <Link
              href={`/artists/${artistSlug}/notices/${n.id}`}
              className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm"
              style={{ color: "var(--artist-card-text, var(--ink))" }}
            >
              {n.pinned && <Pin size={12} className="shrink-0" style={{ color: "var(--artist-accent, var(--accent))" }} />}
              <span className="truncate">{n.title}</span>
              {n.hasImage && <ImageIcon aria-label="이미지 포함" className="size-3.5 shrink-0 opacity-60" />}
              <span className="ml-auto shrink-0 pl-2 text-xs opacity-60">{formatRelativeTime(n.sentAt)}</span>
            </Link>
            {isOwner && (
              <NoticeItemMenu
                pinned={n.pinned}
                busy={busyId === n.id}
                onEdit={() => openEdit(n.id)}
                onDelete={() => handleDelete(n.id)}
                onTogglePin={() => handleTogglePin(n.id, !n.pinned)}
              />
            )}
          </li>
        ))}
      </ul>

      {composerOpen && (
        <NoticeComposerModal
          artistId={artistId}
          onClose={() => setComposerOpen(false)}
          onSaved={() => {
            setComposerOpen(false);
            refetch();
          }}
        />
      )}

      {editTarget && (
        <NoticeComposerModal
          artistId={artistId}
          editTarget={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
