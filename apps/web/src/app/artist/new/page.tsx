import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ArtistNewForm } from "./artist-new-form";

export default async function ArtistNewPage() {
  const session = await getSession();
  if (!session) redirect("/signup?next=/artist/new");

  return <ArtistNewForm />;
}
