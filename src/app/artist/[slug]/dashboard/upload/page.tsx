import { redirect } from "next/navigation";

/** Legacy URL — the generic new-release mockup was removed; only the real track wizard remains. */
export default async function UploadRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/artist/${slug}/dashboard/upload/track`);
}
