"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  computeRightsStatus,
  getTrackById,
  updateTrack,
  type RightsDetail,
  type Track,
} from "@/lib/tracks-storage";
import { getRightsStatusBadge } from "@/lib/rights-status-badge";
import { RightsForm } from "@/components/rights-form";

export default function EditTrackRightsPage() {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null | undefined>(undefined);
  const [rightsDetail, setRightsDetail] = useState<RightsDetail | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTrackById(id).then((found) => {
      setTrack(found ?? null);
      if (found) setRightsDetail(found.rightsDetail);
    });
  }, [id]);

  const handleSave = async () => {
    if (!rightsDetail || !track) return;
    setSaveError(null);
    setSaving(true);
    try {
      const rightsStatus = computeRightsStatus(rightsDetail);
      await updateTrack(track.id, { rightsDetail, rightsStatus });
      setTrack({ ...track, rightsDetail, rightsStatus });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (track === undefined) return null;

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

  const badge = getRightsStatusBadge(rightsDetail ? computeRightsStatus(rightsDetail) : track.rightsStatus);

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
          <RightsForm value={rightsDetail} onChange={(v) => { setRightsDetail(v); setSaved(false); setSaveError(null); }} />

          {saved && <p className="text-sm font-semibold text-emerald-700">저장했어요.</p>}
          {saveError && (
            <p className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-700">
              {saveError}
            </p>
          )}

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
