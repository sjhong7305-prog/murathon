import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { formatWon, formatDateTime } from "@muraton/shared/format";
import { updateShippingStatusAction } from "../actions";
import { ShippingStatusSelect } from "../shipping-status-select";

export default async function BackofficeOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { type: true } } } }, primaryArtist: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/orders" className="text-sm font-semibold text-muted hover:text-ink">
        ← 주문 목록
      </Link>

      <h1 className="mt-2 text-2xl font-black text-ink">주문 상세</h1>
      <p className="mt-1 font-mono text-xs text-muted">{order.id}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface p-4 text-sm">
        <div>
          <p className="text-xs text-muted">구매자</p>
          <p className="mt-0.5 font-semibold text-ink">{order.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted">이메일</p>
          <p className="mt-0.5 font-semibold text-ink">{order.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted">주문일시</p>
          <p className="mt-0.5 text-ink">{formatDateTime(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">서포터 등록</p>
          <p className="mt-0.5 text-ink">
            {order.listAsSupporter ? `🏆 ${order.primaryArtist?.name ?? "-"}` : "아니오"}
          </p>
        </div>
      </div>

      {order.cheerMessage && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm">
          <p className="text-xs text-muted">응원 메시지</p>
          <p className="mt-1 italic text-ink">“{order.cheerMessage}”</p>
        </div>
      )}

      {order.promptQuestion && order.promptAnswer && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm">
          <p className="font-semibold text-muted">Q. {order.promptQuestion}</p>
          <p className="mt-1 text-ink">A. {order.promptAnswer}</p>
        </div>
      )}

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold text-ink">주문 상품 ({order.items.length})</p>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => {
            const updateShipping = updateShippingStatusAction.bind(null, item.id);
            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{item.titleSnapshot}</p>
                  <p className="text-xs text-muted">{item.artistNameSnapshot}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-ink">
                    {formatWon(item.price)} × {item.quantity}
                  </p>
                  {item.product.type === "MERCH" && (
                    <ShippingStatusSelect action={updateShipping} defaultValue={item.shippingStatus} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm font-bold text-ink">
          <span>합계</span>
          <span>{formatWon(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
