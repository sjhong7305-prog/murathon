import Link from "next/link";
import { getArtistById } from "@/lib/data";
import { prisma } from "@muraton/db";
import { formatWon } from "@muraton/shared/format";
import { requireArtistMember } from "@/lib/auth";

const MOCK_PLAYS = 3482;
const MOCK_FOLLOWER_BASE = 118;

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { artist } = await requireArtistMember(slug);
  const [ME, myOrderItems] = await Promise.all([
    getArtistById(artist.id),
    prisma.orderItem.findMany({
      where: { product: { artistId: artist.id } },
      select: { price: true, quantity: true, orderId: true },
    }),
  ]);
  if (!ME) return null;

  const totalRevenue = myOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOrders = new Set(myOrderItems.map((item) => item.orderId)).size;
  const totalFollowers = MOCK_FOLLOWER_BASE + (ME.supporters?.length ?? 0);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">아티스트 대시보드</h1>
          <p className="mt-1 text-sm text-muted">
            {ME.name}의 수익과 릴리즈 현황을 한눈에 확인하세요. (프로토타입 목업 데이터)
          </p>
        </div>
        <Link
          href="/my-tracks"
          className="shrink-0 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/20"
        >
          🎵 내 트랙
        </Link>
      </div>

      {artist.payoutStatus !== "VERIFIED" && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="text-sm text-amber-800">
            💳 정산 정보가 아직 확인되지 않았어요. 출금하려면 정산 정보를 등록해주세요.
          </p>
          <Link
            href={`/artist/${artist.slug}/dashboard/payouts`}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-accent-strong"
          >
            정산 정보 등록
          </Link>
        </div>
      )}

      <section className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-muted">총 후원 금액</p>
          <p className="mt-1 truncate text-xl font-black text-ink">{formatWon(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-muted">총 주문 건수</p>
          <p className="mt-1 text-xl font-black text-ink">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-muted">총 재생수</p>
          <p className="mt-1 text-xl font-black text-ink">{MOCK_PLAYS.toLocaleString("ko-KR")}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-muted">팔로워 수</p>
          <p className="mt-1 text-xl font-black text-ink">{totalFollowers.toLocaleString("ko-KR")}</p>
        </div>
      </section>
    </div>
  );
}
