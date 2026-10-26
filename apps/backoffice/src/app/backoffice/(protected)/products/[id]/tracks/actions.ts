"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/storefront";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { logAdminAction } from "@/lib/audit-log";

export async function saveTracksAction(productId: string, formData: FormData) {
  const session = await requireAdmin();

  const rowCount = Number(formData.get("rowCount") ?? 0);
  const rows: { trackNumber: number; title: string; durationSec: number; previewUrl: string | null; isTitle: boolean }[] = [];

  for (let i = 0; i < rowCount; i++) {
    const title = String(formData.get(`title_${i}`) ?? "").trim();
    if (!title) continue;
    rows.push({
      trackNumber: Number(formData.get(`trackNumber_${i}`) ?? i + 1) || i + 1,
      title,
      durationSec: Number(formData.get(`durationSec_${i}`) ?? 0) || 0,
      previewUrl: String(formData.get(`previewUrl_${i}`) ?? "").trim() || null,
      isTitle: formData.get(`isTitle_${i}`) === "on",
    });
  }

  await prisma.$transaction([
    prisma.albumTrack.deleteMany({ where: { productId } }),
    ...rows.map((row) => prisma.albumTrack.create({ data: { productId, ...row } })),
  ]);

  await logAdminAction({
    actorId: session.user.id,
    action: "product.tracks.update",
    targetType: "Product",
    targetId: productId,
    metadata: { trackCount: rows.length },
  });

  revalidatePath(`/backoffice/products/${productId}/tracks`);
  await revalidateStorefront(`/products/${productId}`);
  redirect(`/backoffice/products/${productId}/edit`);
}
