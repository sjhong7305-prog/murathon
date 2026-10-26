import path from "path";
import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";

// Shared settings (DATABASE_URL, COS keys) live in the repo-root .env so both apps use one copy.
// Next loads this app folder's own .env first and dotenv never overrides a variable
// that is already set, so a .env inside this folder wins.
loadEnv({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const nextConfig: NextConfig = {
  allowedDevOrigins: ["43.128.132.104"],
  transpilePackages: ["@muraton/db", "@muraton/shared"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
