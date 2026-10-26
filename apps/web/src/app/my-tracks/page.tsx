"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatWon } from "@muraton/shared/format";
import { useAuth } from "@/context/auth-context";
import { LoginRequired } from "@/components/login-required";
import { getTracks, type Track } from "@/lib/tracks-storage";
import { getRightsStatusBadge } from "@/lib/rights-status-badge";

export default function MyTracksPage() {
  const { loading, activeArtistId } = useAuth();
  const [tracks, setTracks] = useState<Track[] | null>(null);

  useEffect(() => {
    if (!activeArtistId) return;
    getTracks(activeArtistId).then(setTracks);
  }, [activeArtistId]);

  if (loading) return null;
  if (!activeArtistId) return <LoginRequired />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">내 트랙</h1>
          <p className="mt-1 text-sm text-muted">
            업로드한 트랙과 권리 확인 상태를 관리하세요. “확인이 더 필요해요” 상태인 트랙은 언제든 다시 편집할 수 있어요.
          </p>
        </div>
        <Link
          href="/dashboard/upload/track"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          + 음원 업로드
        </Link>
      </div>

      {tracks === null ? null : tracks.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted">
          아직 업로드한 트랙이 없어요.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {tracks.map((track) => {
            const badge = getRightsStatusBadge(track.rightsStatus);
            return (
              <Link
                key={track.id}
                href={`/my-tracks/${track.id}/edit`}
                className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{track.title}</p>
                  <p className="text-sm text-muted">
                    {track.artist} · {track.pricingType === "pwyw" ? "자율 가격" : "고정 가격"}{" "}
                    {formatWon(track.minPrice)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${badge.className}`}
                >
                  {badge.emoji} {badge.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
