import Link from "next/link";
import { artists, getProductsByArtist, getProductById } from "@/lib/data";
import { mockOrders } from "@/lib/mock-orders";
import { formatWon } from "@/lib/format";
import { CoverArt } from "@/components/cover-art";

const ME = artists[0];
const MOCK_PLAYS = 3482;
const MOCK_FOLLOWER_BASE = 118;

export default function DashboardPage() {
  if (!ME) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">아직 등록된 아티스트가 없어요</h1>
        <p className="mt-2 text-sm text-muted">
          음원을 업로드하면 대시보드에서 현황을 확인할 수 있어요.
        </p>
        <Link
          href="/dashboard/upload/track"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          🎵 음원 업로드하기
        </Link>
      </div>
    );
  }

  const myOrders = mockOrders.filter((o) => getProductById(o.productId)?.artistId === ME.id);
  const totalRevenue = myOrders.reduce((sum, o) => sum + o.price, 0);
  const totalOrders = myOrders.length;
  const totalFollowers = MOCK_FOLLOWER_BASE + (ME.supporters?.length ?? 0);
  const releases = getProductsByArtist(ME.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">아티스트 대시보드</h1>
          <p className="mt-1 text-sm text-muted">
            {ME.name}의 수익과 릴리즈 현황을 한눈에 확인하세요. (프로토타입 목업 데이터)
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/my-tracks"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/20"
          >
            🎵 내 트랙
          </Link>
          <Link
            href="/mypage/artist"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/20"
          >
            💬 팬 메시지 · 커뮤니티는 마이페이지에서
          </Link>
        </div>
      </div>

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

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">릴리즈 관리</h2>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/dashboard/upload/track"
              className="rounded-full border border-accent/40 px-5 py-2.5 text-sm font-bold text-accent-strong transition hover:bg-accent/10"
            >
              🎵 음원 업로드
            </Link>
            <Link
              href="/dashboard/upload"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              + 새 릴리즈 업로드
            </Link>
          </div>
        </div>

        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {releases.map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-10 shrink-0">
                <CoverArt
                  gradient={product.coverColor}
                  label=""
                  imageUrl={product.imageUrl}
                  sizes="40px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{product.title}</p>
                <p className="text-xs text-muted">{product.format}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-ink">
                {formatWon(product.suggestedPrice)}
              </span>
              <Link
                href="/dashboard/upload"
                className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-black/20 hover:text-ink"
              >
                수정
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
