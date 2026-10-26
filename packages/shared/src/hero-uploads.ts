import { readFile } from "fs/promises";
import path from "path";

/**
 * Hero images are written by the backoffice app and served by both apps (the storefront
 * renders them; the backoffice shows preview thumbnails). Each app runs from its own
 * folder (apps/web, apps/backoffice), so by default both point at one repo-root directory.
 * That only works while the two apps share a disk — set HERO_UPLOAD_DIR to a shared mount,
 * or move these files to object storage (COS), before running them on separate machines.
 */
export const HERO_UPLOAD_DIR =
  process.env.HERO_UPLOAD_DIR ?? path.resolve(process.cwd(), "../../uploads/hero");

export const HERO_UPLOAD_URL_PREFIX = "/api/uploads/hero/";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

/**
 * `next start` snapshots the public/ directory's file list at boot, so files written
 * afterward would 404 until a restart. Reading from disk on every request makes uploads
 * servable immediately without a redeploy.
 */
export async function serveHeroUpload(filename: string): Promise<Response> {
  if (filename.includes("/") || filename.includes("..")) {
    return Response.json({ error: "invalid filename" }, { status: 400 });
  }

  try {
    // Uploads are runtime data, not build input — keep the bundler from tracing this dir.
    const buffer = await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ HERO_UPLOAD_DIR, filename));
    const ext = path.extname(filename).toLowerCase();
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
