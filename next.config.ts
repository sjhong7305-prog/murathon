import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["43.128.132.104"],
  experimental: {
    serverActions: {
      // Must stay >= MAX_UPLOAD_BYTES in backoffice/hero/actions.ts.
      bodySizeLimit: "10mb",
    },
    // proxy.ts buffers every request body up to this limit and silently truncates the rest
    // (no error to the client, just a server-log warning and a broken FormData parse) — so it
    // must stay comfortably above the largest legitimate multipart upload. The biggest one today
    // is the track-upload wizard's audio file (MAX_TRACK_AUDIO_BYTES, 100MB — FLAC/WAV run much
    // bigger than mp3), not the artist theme editor's combined images (~17MB) anymore.
    proxyClientMaxBodySize: "110mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "mzc-sjhong-1368713084.cos.ap-seoul.myqcloud.com",
      },
    ],
    // This VM's DNS resolves the COS hostname above to a private/link-local IP (Tencent's
    // intra-network routing for COS) — real visitors' browsers resolve it normally, but Next's
    // image optimizer runs server-side here and would otherwise refuse to fetch it as a
    // possible SSRF target. Safe to allow: remotePatterns above already locks fetches to just
    // this one bucket + picsum, so nothing attacker-controlled can reach this code path.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
