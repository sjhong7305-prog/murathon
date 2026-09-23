import sharp, { type Sharp, type Metadata, type Stats } from "sharp";
import { MAX_BANNER_BYTES, MAX_PROFILE_BYTES, MAX_BACKGROUND_BYTES } from "./artist-image-limits";
import { MAX_FEED_IMAGE_BYTES } from "./artist-feed-constants";
import { MAX_TRACK_COVER_BYTES } from "./track-upload-constants";

export { MAX_BANNER_BYTES, MAX_PROFILE_BYTES, MAX_BACKGROUND_BYTES };

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class ImageValidationError extends Error {}

/**
 * Authoritative image validation: decodes the actual bytes with sharp and checks the real
 * format, since the client-supplied filename extension and MIME type are both spoofable. Also
 * rejects anything sharp can't decode as an image at all (e.g. SVG, which can carry scripts and
 * was never an allowed format here).
 */
async function decodeAndAssertFormat(buffer: Buffer): Promise<Sharp> {
  const image = sharp(buffer);
  let metadata: Metadata;
  try {
    metadata = await image.metadata();
  } catch {
    throw new ImageValidationError("이미지 파일을 읽을 수 없어요.");
  }
  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    throw new ImageValidationError("jpg, png, webp 파일만 업로드할 수 있어요.");
  }
  return image;
}

async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

export async function processBannerUpload(file: File): Promise<Buffer> {
  if (file.size > MAX_BANNER_BYTES) {
    throw new ImageValidationError("배너 이미지는 10MB 이하로 업로드해주세요.");
  }
  const image = await decodeAndAssertFormat(await fileToBuffer(file));
  return image.resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
}

export async function processProfileImageUpload(file: File): Promise<Buffer> {
  if (file.size > MAX_PROFILE_BYTES) {
    throw new ImageValidationError("프로필 이미지는 2MB 이하로 업로드해주세요.");
  }
  const image = await decodeAndAssertFormat(await fileToBuffer(file));
  return image
    .resize({ width: 512, height: 512, fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
}

/**
 * Feed post images — unlike the banner/profile pipelines, aspect ratio is preserved (no forced
 * crop) since feed media can be portrait or landscape, and the resulting width/height are
 * returned so ArtistPostMedia can store them for locked-post placeholder aspect ratios.
 */
export async function processFeedImageUpload(file: File): Promise<{ buffer: Buffer; width: number; height: number }> {
  if (file.size > MAX_FEED_IMAGE_BYTES) {
    throw new ImageValidationError("이미지는 10MB 이하로 업로드해주세요.");
  }
  const image = await decodeAndAssertFormat(await fileToBuffer(file));
  const buffer = await image.resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const { width, height } = await sharp(buffer).metadata();
  return { buffer, width: width ?? 0, height: height ?? 0 };
}

/** Track/release cover art — forced square, same crop convention as CoverArt's aspect-square rendering. */
export async function processTrackCoverUpload(file: File): Promise<Buffer> {
  if (file.size > MAX_TRACK_COVER_BYTES) {
    throw new ImageValidationError("커버 이미지는 8MB 이하로 업로드해주세요.");
  }
  const image = await decodeAndAssertFormat(await fileToBuffer(file));
  return image
    .resize({ width: 1200, height: 1200, fit: "cover", position: "attention" })
    .webp({ quality: 85 })
    .toBuffer();
}

function meanChannelsToHex(channels: Stats["channels"]): string {
  const toHex = (v: number) =>
    Math.round(v).toString(16).padStart(2, "0");
  return `#${toHex(channels[0].mean)}${toHex(channels[1].mean)}${toHex(channels[2].mean)}`;
}

export async function processBackgroundImageUpload(
  file: File
): Promise<{ buffer: Buffer; meanColor: string }> {
  if (file.size > MAX_BACKGROUND_BYTES) {
    throw new ImageValidationError("배경 이미지는 5MB 이하로 업로드해주세요.");
  }
  const image = await decodeAndAssertFormat(await fileToBuffer(file));
  const resized = image.resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 75 });
  const buffer = await resized.toBuffer();
  const stats = await sharp(buffer).stats();
  return { buffer, meanColor: meanChannelsToHex(stats.channels) };
}
