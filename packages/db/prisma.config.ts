import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// The Prisma CLI runs from this package's folder, but DATABASE_URL lives in the
// repo-root .env shared by both apps. A package-local .env (if any) wins.
config({ path: [".env", "../../.env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    // Seed data is storefront content, so the script lives with the web app.
    seed: "tsx ../../apps/web/scripts/seed.ts",
  },
});
