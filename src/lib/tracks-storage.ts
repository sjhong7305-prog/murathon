export type CompositionTrustStatus = "komca" | "koscap" | "none" | "unknown";
export type PerformanceTrustStatus = "fkmp" | "none" | "unknown";
export type ProductionTrustStatus = "riak" | "none" | "unknown";

export interface CompositionRightsHolder {
  name: string;
  trustStatus: CompositionTrustStatus;
  memberCode?: string;
}

export interface PerformanceRightsHolder {
  name: string;
  trustStatus: PerformanceTrustStatus;
  memberCode?: string;
}

export interface ProductionRights {
  entity: string;
  trustStatus: ProductionTrustStatus;
  memberCode?: string;
}

export interface RightsDetail {
  composition: CompositionRightsHolder[];
  performance: PerformanceRightsHolder[];
  production: ProductionRights;
}

export type RightsStatus = "clear" | "pending_review" | "trust_registered";

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  description: string;
  previewAudioUrl?: string;
  pricingType: "pwyw" | "fixed";
  minPrice: number;
  previewLimitSeconds: number;
  rightsStatus: RightsStatus;
  rightsDetail: RightsDetail;
  consentConfirmedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type NewTrackInput = Omit<Track, "id" | "createdAt" | "updatedAt" | "rightsStatus">;

export async function getTracks(): Promise<Track[]> {
  const res = await fetch("/api/tracks");
  if (!res.ok) throw new Error("트랙 목록을 불러오지 못했어요.");
  return res.json();
}

export async function getTrackById(id: string): Promise<Track | undefined> {
  const res = await fetch(`/api/tracks/${id}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("트랙을 불러오지 못했어요.");
  return res.json();
}

export async function addTrack(track: NewTrackInput): Promise<Track> {
  const res = await fetch("/api/tracks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(track),
  });
  if (!res.ok) throw new Error("트랙 업로드에 실패했어요.");
  return res.json();
}

export async function updateTrack(
  id: string,
  updates: { rightsDetail: RightsDetail }
): Promise<Track> {
  const res = await fetch(`/api/tracks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("트랙 수정에 실패했어요.");
  return res.json();
}

/**
 * 작곡/실연/제작 각 역할의 등록(신탁) 상태를 합산해 트랙 전체 상태를 계산한다.
 * 우선순위: 모름이 하나라도 있으면 검토 대기 → 등록된 곳이 하나라도 있으면 등록됨 → 그 외 전부 클리어.
 */
export function computeRightsStatus(detail: RightsDetail): RightsStatus {
  const statuses: string[] = [
    ...detail.composition.map((c) => c.trustStatus),
    ...detail.performance.map((p) => p.trustStatus),
    detail.production.trustStatus,
  ];

  if (statuses.some((s) => s === "unknown")) return "pending_review";
  if (statuses.some((s) => s !== "none")) return "trust_registered";
  return "clear";
}
