import { ReactNode } from "react";
import { requireArtistMember } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function ArtistDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireArtistMember(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:flex lg:items-start lg:gap-8">
      <DashboardSidebar slug={slug} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
