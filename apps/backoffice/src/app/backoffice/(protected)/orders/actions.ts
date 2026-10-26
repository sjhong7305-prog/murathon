"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { logAdminAction } from "@/lib/audit-log";

export async function updateShippingStatusAction(orderItemId: string, formData: FormData) {
  const session = await requireAdmin();
  const shippingStatus = String(formData.get("shippingStatus") ?? "");
  if (shippingStatus !== "PAID" && shippingStatus !== "SHIPPING" && shippingStatus !== "DELIVERED") {
    return;
  }

  const item = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { shippingStatus },
  });

  await logAdminAction({
    actorId: session.user.id,
    action: "order-item.shipping-status.update",
    targetType: "OrderItem",
    targetId: orderItemId,
    metadata: { shippingStatus },
  });

  revalidatePath(`/backoffice/orders/${item.orderId}`);
}
