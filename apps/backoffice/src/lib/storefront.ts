/**
 * Asks the storefront app (a separate process) to refresh pages after a backoffice edit.
 * Failures are logged, not thrown: the edit is already saved, and the storefront's own
 * time-based revalidation picks it up eventually.
 */
export async function revalidateStorefront(...paths: string[]) {
  const baseUrl = process.env.STOREFRONT_URL ?? "http://localhost:3000";
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.warn("[revalidateStorefront] REVALIDATE_SECRET is not set; storefront pages refresh on their own schedule.");
    return;
  }

  try {
    const res = await fetch(new URL("/api/revalidate", baseUrl), {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
    if (!res.ok) {
      console.warn(`[revalidateStorefront] ${res.status} from storefront for ${paths.join(", ")}`);
    }
  } catch (err) {
    console.warn("[revalidateStorefront] storefront unreachable:", err);
  }
}
