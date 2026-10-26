import type { Prisma } from "@muraton/db";

type DbTrack = {
  id: string;
  artistId: string;
  title: string;
  artistNameSnapshot: string;
  genre: string;
  description: string;
  previewAudioUrl: string | null;
  pricingType: "PWYW" | "FIXED";
  minPrice: number;
  previewLimitSeconds: number;
  rightsStatus: "CLEAR" | "PENDING_REVIEW" | "TRUST_REGISTERED";
  rightsDetail: Prisma.JsonValue;
  storyPrompts: Prisma.JsonValue;
  consentConfirmedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeTrack(t: DbTrack) {
  return {
    id: t.id,
    artistId: t.artistId,
    title: t.title,
    artist: t.artistNameSnapshot,
    genre: t.genre,
    description: t.description,
    previewAudioUrl: t.previewAudioUrl ?? undefined,
    pricingType: t.pricingType.toLowerCase() as "pwyw" | "fixed",
    minPrice: t.minPrice,
    previewLimitSeconds: t.previewLimitSeconds,
    rightsStatus: t.rightsStatus.toLowerCase() as "clear" | "pending_review" | "trust_registered",
    rightsDetail: t.rightsDetail,
    storyPrompts: t.storyPrompts ?? undefined,
    consentConfirmedAt: t.consentConfirmedAt,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}
