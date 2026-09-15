"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  computeRightsStatus,
  getTrackById,
  updateTrack,
  type RightsDetail,
  type RightsStatus,
  type Track,
} from "@/lib/tracks-storage";
import { RightsForm } from "@/components/rights-form";

const STATUS_BADGE: Record<RightsStatus, { emoji: string; label: string }> = {
  clear: { emoji: "🟢", label: "바로 판매 가능" },
  pending_review: { emoji: "🟡", label: "확인이 더 필요해요" },
  trust_registered: { emoji: "🔵", label: "협회 정산 연동 필요" },
};

export default function EditTrackRightsPage() {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null | undefined>(undefined);
  const [rightsDetail, setRightsDetail] = useState<RightsDetail | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTrackById(id)
      .then((found) => {
        setTrack(found ?? null);
        if (found) setRightsDetail(found.rightsDetail);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "불러오기에 실패했어요."));
  }, [id]);

  const handleSave = async () => {
    if (!rightsDetail || !track || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTrack(track.id, { rightsDetail });
      setTrack(updated);
      setRightsDetail(updated.rightsDetail);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  };

  if (track === undefined) {
    if (!error) return null;
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      </div>
    );
  }

  if (track === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">트랙을 찾을 수 없어요</h1>
        <Link
          href="/my-tracks"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          내 트랙으로 돌아가기
        </Link>
      </div>
    );
  }

  const badge = STATUS_BADGE[rightsDetail ? computeRightsStatus(rightsDetail) : track.rightsStatus];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/my-tracks" className="text-sm font-semibold text-muted hover:text-ink">
        ← 내 트랙
      </Link>
      <h1 className="mt-2 text-2xl font-black text-ink">{track.title}</h1>
      <p className="mt-1 text-sm text-muted">권리 확인 정보를 다시 편집할 수 있어요.</p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-ink">
        <span>{badge.emoji}</span>
        <span>{badge.label}</span>
      </div>

      {rightsDetail && (
        <div className="mt-6 flex flex-col gap-4">
          <RightsForm value={rightsDetail} onChange={(v) => { setRightsDetail(v); setSaved(false); }} />

          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          {saved && <p className="text-sm font-semibold text-emerald-700">저장했어요.</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      )}
    </div>
  );
}
