import { redirect } from "next/navigation";
import { getSession, getActiveArtistId } from "@/lib/auth";

/** Legacy URL — moved under /artist/[slug]/dashboard/upload/track. */
export default async function DashboardUploadTrackRedirect() {
  const session = await getSession();
  if (!session) redirect("/login");

  const activeArtistId = await getActiveArtistId(session.user);
  const membership =
    session.user.artistMemberships.find((m) => m.artistId === activeArtistId) ??
    session.user.artistMemberships[0];

  redirect(membership ? `/artist/${membership.artist.slug}/dashboard/upload/track` : "/artist/new");
}
