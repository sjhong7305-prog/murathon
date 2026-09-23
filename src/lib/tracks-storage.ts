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

export interface StoryPrompts {
  origin: string;
  struggle: string;
  audience: string;
}

export interface Track {
  id: string;
  artistId: string;
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
  storyPrompts?: StoryPrompts;
  consentConfirmedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewTrackInput {
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
  storyPrompts?: StoryPrompts;
  consentConfirmedAt: string;
}

export async function getTracks(artistId: string): Promise<Track[]> {
  try {
    const res = await fetch(`/api/tracks?artistId=${encodeURIComponent(artistId)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getTrackById(id: string): Promise<Track | undefined> {
  try {
    const res = await fetch(`/api/tracks/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}

/** Throws with a user-facing Korean message on any non-2xx response — never hands the caller a malformed "track". */
async function readTrackResponse(res: Response): Promise<Track> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error === "forbidden" || body?.error === "unauthorized"
      ? "이 트랙을 등록/수정할 권한이 없어요."
      : "저장하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
  return res.json();
}

export async function addTrack(artistId: string, input: NewTrackInput): Promise<Track> {
  const res = await fetch("/api/tracks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artistId, ...input }),
  });
  return readTrackResponse(res);
}

export async function updateTrack(
  id: string,
  updates: Partial<Pick<Track, "rightsDetail" | "rightsStatus">>
): Promise<Track> {
  const res = await fetch(`/api/tracks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return readTrackResponse(res);
}

export interface TrackReleaseInput {
  title: string;
  artist: string;
  genre: string;
  description: string;
  imageUrl?: string;
  previewAudioUrl?: string;
  durationSec?: number;
  minPrice: number;
  suggestedPrice: number;
  rightsDetail: RightsDetail;
  storyPrompts?: StoryPrompts;
  consentConfirmedAt: string;
}

export interface TrackReleaseResult {
  track: Track;
  productId: string;
}

/**
 * The "음원 업로드" wizard's submit call — creates both the rights-registration Track (still
 * feeds the backoffice 권리검토 queue and /tracks/[id]) and a real, purchasable Product in one
 * request. See src/app/api/artists/[id]/tracks/route.ts for why the two aren't linked by an FK.
 */
export async function createTrackRelease(artistId: string, input: TrackReleaseInput): Promise<TrackReleaseResult> {
  const res = await fetch(`/api/artists/${artistId}/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "저장하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
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
