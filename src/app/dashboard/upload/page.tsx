import { redirect } from "next/navigation";
import { getSession, getActiveArtistId } from "@/lib/auth";

/** Legacy URL — moved under /artist/[slug]/dashboard/upload. */
export default async function DashboardUploadRedirect() {
  const session = await getSession();
  if (!session) redirect("/login");

  const activeArtistId = await getActiveArtistId(session.user);
  const membership =
    session.user.artistMemberships.find((m) => m.artistId === activeArtistId) ??
    session.user.artistMemberships[0];

  redirect(membership ? `/artist/${membership.artist.slug}/dashboard/upload` : "/artist/new");
}
