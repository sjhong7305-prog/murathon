// Tencent Cloud COS integration. Bucket holds all media: album art, artist
// profile/banner images, and artist feed images/videos.
import COS from "cos-nodejs-sdk-v5";

const COS_BUCKET = "mzc-sjhong-1368713084";
const COS_REGION = "ap-seoul";

export const COS_BASE_URL = `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`;

export type CosFolder = "artists" | "albums" | "tracks" | "feed" | "broadcasts" | "uploads";

export function getCosUrl(folder: CosFolder, filename: string): string {
  return `${COS_BASE_URL}/${folder}/${filename}`;
}

export interface UploadResult {
  url: string;
  key: string;
}

let cosClient: COS | null = null;

/** Lazily constructed so files that only build URLs (getCosUrl) don't need credentials at import time. */
function getCosClient(): COS {
  if (!cosClient) {
    const SecretId = process.env.COS_SECRET_ID;
    const SecretKey = process.env.COS_SECRET_KEY;
    if (!SecretId || !SecretKey) {
      throw new Error("COS_SECRET_ID / COS_SECRET_KEY are not set in the environment.");
    }
    cosClient = new COS({ SecretId, SecretKey });
  }
  return cosClient;
}

export async function uploadToCos(
  folder: CosFolder,
  file: File | Blob,
  filename: string,
): Promise<UploadResult> {
  const cos = getCosClient();
  const key = `${folder}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: key,
        Body: buffer,
        ContentLength: buffer.length,
        // Bucket's own default ACL is private; every object we serve via a plain <img>/<video>
        // src needs to be public-read individually, since we don't do signed-URL delivery.
        ACL: "public-read",
      },
      (err) => (err ? reject(err) : resolve()),
    );
  });

  return { url: getCosUrl(folder, filename), key };
}

export interface PresignedUpload {
  /** Signed PUT URL — the browser uploads directly to COS with this, bypassing our server entirely. */
  uploadUrl: string;
  /** The URL the object will be reachable at once uploaded — store this, not uploadUrl. */
  publicUrl: string;
  /** The exact headers the PUT request must send — they're part of what was signed, so any mismatch (or omission) makes COS reject the request. */
  headers: Record<string, string>;
}

/**
 * Presigned direct-to-COS upload, used for feed video (up to 500MB) so it never gets buffered
 * through the Next.js server (unlike images, which still go through processBannerUpload-style
 * server pipelines for resize/webp — video has no server-side processing today, so there's
 * nothing to gain from routing it through our server, only memory risk to avoid).
 * The bucket's default ACL is private (see uploadToCos), so `x-cos-acl: public-read` is signed
 * into the URL and must be sent back by the client verbatim.
 */
export function getPresignedUploadUrl(
  folder: CosFolder,
  filename: string,
  contentType: string,
): Promise<PresignedUpload> {
  const cos = getCosClient();
  const key = `${folder}/${filename}`;
  const headers = { "x-cos-acl": "public-read", "Content-Type": contentType };

  return new Promise((resolve, reject) => {
    cos.getObjectUrl(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: key,
        Method: "PUT",
        Sign: true,
        Expires: 900,
        Headers: headers,
      },
      (err, data) => {
        if (err) reject(err);
        else resolve({ uploadUrl: data.Url, publicUrl: getCosUrl(folder, filename), headers });
      },
    );
  });
}

export async function deleteFromCos(folder: CosFolder, filename: string): Promise<void> {
  const cos = getCosClient();
  const key = `${folder}/${filename}`;

  await new Promise<void>((resolve, reject) => {
    cos.deleteObject({ Bucket: COS_BUCKET, Region: COS_REGION, Key: key }, (err) =>
      err ? reject(err) : resolve(),
    );
  });
}

/** Extracts the {folder}/{filename} key from a URL produced by getCosUrl, for deleteFromCos. */
export function parseCosKey(url: string): { folder: CosFolder; filename: string } | null {
  if (!url.startsWith(`${COS_BASE_URL}/`)) return null;
  const [folder, ...rest] = url.slice(COS_BASE_URL.length + 1).split("/");
  const filename = rest.join("/");
  if (!folder || !filename) return null;
  return { folder: folder as CosFolder, filename };
}
