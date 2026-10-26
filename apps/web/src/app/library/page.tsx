import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/** Legacy URL — "내 서재" is now the 플레이리스트 tab on the fan collection page. */
export default async function LibraryRedirect() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(`/fans/${session.user.id}?tab=playlists`);
}
