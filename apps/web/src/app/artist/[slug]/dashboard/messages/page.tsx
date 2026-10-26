import { requireArtistMember } from "@/lib/auth";
import { FanMessageFeed } from "@/components/fan-message-feed";

export default async function DashboardMessagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist } = await requireArtistMember(slug);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-black text-ink">팬 메시지</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        팬들이 구매하면서 남긴 응원 메시지를 확인하세요. 메시지를 누르면 해당 상품 페이지로 이동해요.
      </p>
      <FanMessageFeed artistId={artist.id} />
    </div>
  );
}
