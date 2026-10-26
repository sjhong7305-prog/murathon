import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";

/**
 * The backoffice runs as a separate app, so its own revalidatePath() can't reach this
 * app's cache. It calls this endpoint instead after edits that change storefront pages.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || token.length !== secret.length || !timingSafeEqual(Buffer.from(token), Buffer.from(secret))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { paths?: unknown } | null;
  const paths = Array.isArray(body?.paths) ? body.paths : [];
  if (paths.length === 0 || !paths.every((p) => typeof p === "string" && p.startsWith("/"))) {
    return Response.json({ error: "paths must be a non-empty array of absolute paths" }, { status: 400 });
  }

  for (const path of paths as string[]) {
    revalidatePath(path);
  }
  return Response.json({ revalidated: paths });
}
