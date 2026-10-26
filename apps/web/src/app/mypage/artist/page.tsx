import { redirect } from "next/navigation";
import { getSession, getActiveArtistId } from "@/lib/auth";

const TAB_TO_ROUTE: Record<string, string> = {
  messages: "messages",
  notice: "notices",
  profile: "settings",
};

/** Legacy URL — the artist admin surface merged into /artist/[slug]/dashboard/*. */
export default async function ArtistMyPageRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const activeArtistId = await getActiveArtistId(session.user);
  const membership =
    session.user.artistMemberships.find((m) => m.artistId === activeArtistId) ??
    session.user.artistMemberships[0];

  if (!membership) redirect("/artist/new");

  const slug = membership.artist.slug;

  if (tab === "feed") {
    redirect(`/artists/${slug}/feed`);
  }

  const subRoute = tab && TAB_TO_ROUTE[tab] ? TAB_TO_ROUTE[tab] : "messages";
  redirect(`/artist/${slug}/dashboard/${subRoute}`);
}
