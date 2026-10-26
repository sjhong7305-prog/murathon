import path from "path";
import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";

// Shared settings (DATABASE_URL, REVALIDATE_SECRET) live in the repo-root .env so both apps
// use one copy. Next loads this app folder's own .env first and dotenv never overrides a
// variable that is already set, so a .env inside this folder wins.
loadEnv({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const nextConfig: NextConfig = {
  transpilePackages: ["@muraton/db", "@muraton/shared"],
  experimental: {
    serverActions: {
      // Must stay >= MAX_UPLOAD_BYTES in backoffice/(protected)/hero/actions.ts.
      bodySizeLimit: "10mb",
    },
    // proxy.ts buffers request bodies up to this limit and silently truncates the rest,
    // so it must stay above the largest upload a backoffice form sends (hero images).
    proxyClientMaxBodySize: "20mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mzc-sjhong-1368713084.cos.ap-seoul.myqcloud.com",
      },
    ],
    // Same reason as apps/web: this VM resolves the COS hostname to a private IP.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
