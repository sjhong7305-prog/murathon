import { requireArtistMember } from "@/lib/auth";
import { NoticeComposerPanel } from "./notice-composer-panel";

export default async function DashboardNoticesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist } = await requireArtistMember(slug);

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-black text-ink">공지</h1>
      <NoticeComposerPanel artistId={artist.id} />
    </div>
  );
}
