import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";

const STATUS_BADGE: Record<string, { emoji: string; label: string; className: string }> = {
  CLEAR: { emoji: "🟢", label: "바로 판매 가능", className: "text-emerald-700 bg-emerald-400/10" },
  PENDING_REVIEW: { emoji: "🟡", label: "확인이 더 필요해요", className: "text-amber-700 bg-amber-400/10" },
  TRUST_REGISTERED: { emoji: "🔵", label: "협회 정산 연동 필요", className: "text-sky-700 bg-sky-400/10" },
};

export default async function BackofficeTracksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const showAll = status === "all";

  const tracks = await prisma.track.findMany({
    where: showAll ? undefined : { rightsStatus: "PENDING_REVIEW" },
    include: { artist: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-ink">권리검토</h1>
        <div className="flex gap-2 text-sm">
          <Link
            href="/backoffice/tracks"
            className={`rounded-full px-3 py-1.5 font-semibold ${!showAll ? "bg-accent text-white" : "text-muted hover:text-ink"}`}
          >
            검토 대기
          </Link>
          <Link
            href="/backoffice/tracks?status=all"
            className={`rounded-full px-3 py-1.5 font-semibold ${showAll ? "bg-accent text-white" : "text-muted hover:text-ink"}`}
          >
            전체
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {tracks.length === 0 && (
          <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
            {showAll ? "등록된 트랙이 없습니다." : "검토 대기 중인 트랙이 없습니다."}
          </p>
        )}
        {tracks.map((track) => {
          const badge = STATUS_BADGE[track.rightsStatus];
          return (
            <Link
              key={track.id}
              href={`/backoffice/tracks/${track.id}`}
              className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{track.title}</p>
                <p className="text-sm text-muted">
                  {track.artist.name} · {track.genre}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${badge.className}`}>
                {badge.emoji} {badge.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
