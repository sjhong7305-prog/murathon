import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatWon, formatDateTime } from "@/lib/format";

const PAGE_SIZE = 30;

export default async function BackofficeOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  await requireAdmin();
  const { cursor } = await searchParams;

  const rows = await prisma.order.findMany({
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const orders = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? orders[orders.length - 1].id : null;

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">주문</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-4 py-3 font-semibold">주문번호</th>
              <th className="px-4 py-3 font-semibold">구매자</th>
              <th className="px-4 py-3 font-semibold">이메일</th>
              <th className="px-4 py-3 font-semibold">상품수</th>
              <th className="px-4 py-3 font-semibold">합계</th>
              <th className="px-4 py-3 font-semibold">서포터</th>
              <th className="px-4 py-3 font-semibold">주문일시</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  주문이 없습니다.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-0 hover:bg-black/[0.02]">
                <td className="px-4 py-3">
                  <Link
                    href={`/backoffice/orders/${order.id}`}
                    className="font-mono text-xs font-semibold text-accent-strong hover:underline"
                  >
                    {order.id.slice(0, 12)}…
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">{order.name}</td>
                <td className="px-4 py-3 text-muted">{order.email}</td>
                <td className="px-4 py-3 text-ink">{order.items.length}</td>
                <td className="px-4 py-3 font-semibold text-ink">{formatWon(order.total)}</td>
                <td className="px-4 py-3">
                  {order.listAsSupporter && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-strong">
                      🏆
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {formatDateTime(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <div className="mt-4">
          <Link
            href={`/backoffice/orders?cursor=${nextCursor}`}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-black/20"
          >
            다음 페이지
          </Link>
        </div>
      )}
    </div>
  );
}
