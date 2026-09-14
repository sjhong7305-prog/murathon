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

const STORAGE_KEY = "muraton-tracks";

function readAll(): Track[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(tracks: Track[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function getTracks(): Track[] {
  return readAll();
}

export function getTrackById(id: string): Track | undefined {
  return readAll().find((t) => t.id === id);
}

export function addTrack(track: Track) {
  const tracks = readAll();
  tracks.unshift(track);
  writeAll(tracks);
}

export function updateTrack(id: string, updates: Partial<Track>) {
  const tracks = readAll();
  const next = tracks.map((t) =>
    t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
  );
  writeAll(next);
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

export function generateTrackId() {
  return `TRK-${Date.now().toString(36).toUpperCase()}`;
}
