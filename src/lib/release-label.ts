import type { Product, ReleaseFormatType, ReleaseType } from "./types";

export const RELEASE_TYPE_OPTIONS: { value: ReleaseType; label: string }[] = [
  { value: "single", label: "싱글" },
  { value: "ep", label: "EP" },
  { value: "album", label: "정규 앨범" },
];

const RELEASE_TYPE_LABEL: Record<ReleaseType, string> = {
  single: "싱글",
  ep: "EP",
  album: "정규 앨범",
};

const RELEASE_FORMAT_LABEL: Record<ReleaseFormatType, string> = {
  digital: "디지털",
  cd: "CD",
  vinyl: "바이닐",
  cassette: "카세트",
};

/** 1 → single, 2–5 → ep, 6+ → album. Used both by the migration and to default new-release pickers. */
export function inferReleaseTypeFromTrackCount(trackCount: number): ReleaseType {
  const count = Math.max(trackCount, 1);
  if (count <= 1) return "single";
  if (count <= 5) return "ep";
  return "album";
}

/**
 * The single shared label renderer for a release. For album/track products with a releaseType
 * set, computes "디지털 싱글" / "CD · EP" style from releaseType + formats. Falls back to the
 * legacy free-text `format` field for everything else (merch/ticket, or a release that somehow
 * has no releaseType yet).
 */
export function formatReleaseLabel(
  product: Pick<Product, "type" | "format" | "releaseType" | "formats">
): string {
  const isRelease = product.type === "album" || product.type === "track";
  if (!isRelease || !product.releaseType) return product.format ?? "";

  const typeLabel = RELEASE_TYPE_LABEL[product.releaseType];
  const formats = product.formats ?? [];
  const onlyDigital = formats.length === 0 || (formats.length === 1 && formats[0].format === "digital");
  if (onlyDigital) return `디지털 ${typeLabel}`;

  const formatNames = formats.map((f) => RELEASE_FORMAT_LABEL[f.format]).join(" · ");
  return `${formatNames} · ${typeLabel}`;
}
