import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllArtists, getWishlist } from "@/lib/data";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = { title: "위시리스트 — MU:RATHON" };

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login?message=" + encodeURIComponent("위시리스트를 보려면 로그인이 필요해요."));

  const [releases, artists] = await Promise.all([getWishlist(session.user.id), getAllArtists()]);
  return (
    <WishlistView releases={releases} artists={artists.map(({ id, name, slug }) => ({ id, name, slug }))} />
  );
}
