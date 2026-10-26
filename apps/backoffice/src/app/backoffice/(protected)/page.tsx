import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { formatWon } from "@muraton/shared/format";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function BackofficeDashboardPage() {
  await requireAdmin();

  const [totalOrders, todayOrders, revenue, pendingRights, communityPosts] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday() } } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.track.count({ where: { rightsStatus: "PENDING_REVIEW" } }),
    prisma.communityPost.count(),
  ]);

  const stats = [
    { label: "오늘 주문", value: todayOrders.toLocaleString("ko-KR") },
    { label: "누적 주문", value: totalOrders.toLocaleString("ko-KR") },
    { label: "누적 매출", value: formatWon(revenue._sum.total ?? 0) },
    { label: "권리검토 대기", value: pendingRights.toLocaleString("ko-KR") },
    { label: "커뮤니티 글", value: communityPosts.toLocaleString("ko-KR") },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">대시보드</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 truncate text-xl font-black text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
