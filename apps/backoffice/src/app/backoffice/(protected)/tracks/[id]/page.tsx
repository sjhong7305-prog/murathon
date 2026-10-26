import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { formatWon, formatDateTime } from "@muraton/shared/format";
import { overrideRightsStatusAction } from "./actions";

const STATUS_OPTIONS = [
  { value: "CLEAR", emoji: "🟢", label: "바로 판매 가능" },
  { value: "PENDING_REVIEW", emoji: "🟡", label: "확인이 더 필요해요" },
  { value: "TRUST_REGISTERED", emoji: "🔵", label: "협회 정산 연동 필요" },
] as const;

interface RightsDetail {
  composition: { name: string; trustStatus: string; memberCode?: string }[];
  performance: { name: string; trustStatus: string; memberCode?: string }[];
  production: { entity: string; trustStatus: string; memberCode?: string };
}

export default async function BackofficeTrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const track = await prisma.track.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!track) notFound();

  const detail = track.rightsDetail as unknown as RightsDetail;
  const action = overrideRightsStatusAction.bind(null, track.id);

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/tracks" className="text-sm font-semibold text-muted hover:text-ink">
        ← 권리검토
      </Link>

      <h1 className="mt-2 text-2xl font-black text-ink">{track.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {track.artist.name} · {track.genre}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface p-4 text-sm">
        <div>
          <p className="text-xs text-muted">가격 방식</p>
          <p className="mt-0.5 text-ink">
            {track.pricingType === "PWYW" ? "자율 가격" : "고정 가격"} · {formatWon(track.minPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">동의 확인일</p>
          <p className="mt-0.5 text-ink">{formatDateTime(track.consentConfirmedAt)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted">설명</p>
          <p className="mt-0.5 text-ink">{track.description}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold text-ink">권리 정보</p>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-line bg-surface p-3 text-sm">
            <p className="text-xs font-semibold text-muted">작곡/작사</p>
            {detail.composition.length === 0 && <p className="mt-1 text-ink">-</p>}
            {detail.composition.map((c, i) => (
              <p key={i} className="mt-1 text-ink">
                {c.name} — {c.trustStatus}
                {c.memberCode ? ` (${c.memberCode})` : ""}
              </p>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-surface p-3 text-sm">
            <p className="text-xs font-semibold text-muted">실연</p>
            {detail.performance.length === 0 && <p className="mt-1 text-ink">-</p>}
            {detail.performance.map((p, i) => (
              <p key={i} className="mt-1 text-ink">
                {p.name} — {p.trustStatus}
                {p.memberCode ? ` (${p.memberCode})` : ""}
              </p>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-surface p-3 text-sm">
            <p className="text-xs font-semibold text-muted">제작</p>
            <p className="mt-1 text-ink">
              {detail.production.entity} — {detail.production.trustStatus}
              {detail.production.memberCode ? ` (${detail.production.memberCode})` : ""}
            </p>
          </div>
        </div>
      </div>

      <form action={action} className="mt-6 rounded-xl border border-line bg-surface p-4">
        <p className="mb-2 text-sm font-bold text-ink">상태 변경 (관리자 검토)</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            name="rightsStatus"
            defaultValue={track.rightsStatus}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
