import type { RightsStatus } from "./tracks-storage";

export interface RightsStatusBadge {
  emoji: string;
  label: string;
  className: string;
}

export const RIGHTS_STATUS_BADGE: Record<RightsStatus, RightsStatusBadge> = {
  clear: { emoji: "🟢", label: "바로 판매 가능", className: "text-emerald-700 bg-emerald-400/10" },
  pending_review: {
    emoji: "🟡",
    label: "확인이 더 필요해요",
    className: "text-amber-700 bg-amber-400/10",
  },
  trust_registered: {
    emoji: "🔵",
    label: "협회 정산 연동 필요",
    className: "text-sky-700 bg-sky-400/10",
  },
};

const UNKNOWN_BADGE: RightsStatusBadge = {
  emoji: "⚪",
  label: "상태 확인 필요",
  className: "text-muted bg-line/40",
};

/**
 * Never throws — an unexpected or missing status (e.g. a track object that came back from a
 * failed save, or any other shape drift between client/server) falls back to a neutral badge
 * instead of crashing the page on a direct `.emoji` access.
 */
export function getRightsStatusBadge(status: RightsStatus | null | undefined): RightsStatusBadge {
  if (!status) return UNKNOWN_BADGE;
  return RIGHTS_STATUS_BADGE[status] ?? UNKNOWN_BADGE;
}
