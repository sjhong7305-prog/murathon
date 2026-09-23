import { redirect } from "next/navigation";
import { getSession, getActiveArtistId } from "@/lib/auth";

/** Legacy URL — the dashboard now lives under /artist/[slug]/dashboard since an account can own several profiles. */
export default async function DashboardRedirect() {
  const session = await getSession();
  if (!session) redirect("/login");

  const activeArtistId = await getActiveArtistId(session.user);
  const membership =
    session.user.artistMemberships.find((m) => m.artistId === activeArtistId) ??
    session.user.artistMemberships[0];

  redirect(membership ? `/artist/${membership.artist.slug}/dashboard` : "/artist/new");
}
