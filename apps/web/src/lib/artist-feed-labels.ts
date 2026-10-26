import type { ArtistPostCategory, ArtistPostVisibility } from "@muraton/db";

export const CATEGORY_LABEL: Record<ArtistPostCategory, string> = {
  RECORDING_BEHIND: "녹음 비하인드",
  LIVE_VIDEO: "공연 영상",
  INSTRUMENT_PLAY: "악기 연주",
  LYRICS_INTRO: "가사 소개",
  STUDIO_LIFE: "작업실 일상",
  ETC: "기타",
};

export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as ArtistPostCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

// ETC intentionally renders in a neutral/gray badge so it doesn't compete visually with the
// other (accent-colored) content categories — it's the fallback, not a category to highlight.
export const CATEGORY_BADGE_CLASS: Record<ArtistPostCategory, string> = {
  RECORDING_BEHIND: "bg-accent/15 text-accent-strong",
  LIVE_VIDEO: "bg-accent/15 text-accent-strong",
  INSTRUMENT_PLAY: "bg-accent/15 text-accent-strong",
  LYRICS_INTRO: "bg-accent/15 text-accent-strong",
  STUDIO_LIFE: "bg-accent/15 text-accent-strong",
  ETC: "bg-black/10 text-muted",
};

export const VISIBILITY_LABEL: Record<ArtistPostVisibility, string> = {
  PUBLIC: "전체 공개",
  SUPPORTER: "구매자 전용",
  SUBSCRIBER: "구독자 전용",
};

export const VISIBILITY_OPTIONS = (Object.keys(VISIBILITY_LABEL) as ArtistPostVisibility[]).map((value) => ({
  value,
  label: VISIBILITY_LABEL[value],
}));
