export const FEED_CONTENT_MAX_LENGTH = 1000;
export const FEED_MAX_MEDIA_COUNT = 10;
export const FEED_PAGE_SIZE = 8;

// Image feed uploads go through the server (sharp resize/webp), same cap as the banner pipeline.
export const MAX_FEED_IMAGE_BYTES = 10 * 1024 * 1024;

// Video feed uploads go straight from the browser to COS (presigned URL) — never buffered
// through the Next.js server — so 500MB doesn't cost server memory the way it would for images.
export const MAX_FEED_VIDEO_BYTES = 500 * 1024 * 1024;

export const FEED_VIDEO_ALLOWED_MIME = ["video/mp4", "video/webm", "video/quicktime"];
export const FEED_VIDEO_ALLOWED_EXT = [".mp4", ".webm", ".mov"];
