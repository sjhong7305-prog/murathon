"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { logAdminAction } from "@/lib/audit-log";

export async function overrideRightsStatusAction(trackId: string, formData: FormData) {
  const session = await requireAdmin();
  const rightsStatus = String(formData.get("rightsStatus"));
  if (!["CLEAR", "PENDING_REVIEW", "TRUST_REGISTERED"].includes(rightsStatus)) {
    throw new Error("invalid rightsStatus");
  }

  await prisma.track.update({
    where: { id: trackId },
    data: { rightsStatus: rightsStatus as "CLEAR" | "PENDING_REVIEW" | "TRUST_REGISTERED" },
  });

  await logAdminAction({
    actorId: session.user.id,
    action: "track.rightsStatus.override",
    targetType: "Track",
    targetId: trackId,
    metadata: { rightsStatus },
  });

  revalidatePath(`/backoffice/tracks/${trackId}`);
  revalidatePath("/backoffice/tracks");
}
