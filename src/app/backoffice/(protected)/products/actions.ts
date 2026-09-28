"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-log";
import type { ReleaseType } from "@/lib/types";

const RELEASE_TYPES: ReleaseType[] = ["single", "ep", "album"];

function readProductFields(formData: FormData) {
  const type = String(formData.get("type") ?? "ALBUM") as "ALBUM" | "TRACK" | "MERCH" | "TICKET";
  const isRelease = type === "ALBUM" || type === "TRACK";
  const rawReleaseType = String(formData.get("releaseType") ?? "single");
  const releaseType = isRelease && RELEASE_TYPES.includes(rawReleaseType as ReleaseType)
    ? (rawReleaseType.toUpperCase() as "SINGLE" | "EP" | "ALBUM")
    : null;

  return {
    artistId: String(formData.get("artistId") ?? ""),
    type,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    format: String(formData.get("format") ?? "").trim() || null,
    releaseType,
    minPrice: Number(formData.get("minPrice") ?? 0) || 0,
    suggestedPrice: Number(formData.get("suggestedPrice") ?? 0) || 0,
    coverColor: String(formData.get("coverColor") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    previewAudioUrl: String(formData.get("previewAudioUrl") ?? "").trim() || null,
    secretTitle: String(formData.get("secretTitle") ?? "").trim() || null,
    secretMessage: String(formData.get("secretMessage") ?? "").trim() || null,
    eventName: String(formData.get("eventName") ?? "").trim() || null,
    venue: String(formData.get("venue") ?? "").trim() || null,
    eventAt: (() => {
      const raw = String(formData.get("eventAt") ?? "").trim();
      return raw ? new Date(raw) : null;
    })(),
    includedAlbumId: String(formData.get("includedAlbumId") ?? "").trim() || null,
    longDescription: String(formData.get("longDescription") ?? "").trim().slice(0, 2000) || null,
    releaseDate: (() => {
      const raw = String(formData.get("releaseDate") ?? "").trim();
      return raw ? new Date(raw) : null;
    })(),
    credits: String(formData.get("credits") ?? "").trim() || null,
    durationSec: (() => {
      const raw = String(formData.get("durationSec") ?? "").trim();
      return raw ? Number(raw) : null;
    })(),
  };
}

export async function createProductAction(formData: FormData) {
  const session = await requireAdmin();
  const fields = readProductFields(formData);

  const isRelease = fields.type === "ALBUM" || fields.type === "TRACK";
  const product = await prisma.product.create({
    data: {
      ...fields,
      releaseFormats: isRelease
        ? { create: { format: "DIGITAL", price: fields.suggestedPrice, includesDigital: true, shippingRequired: false } }
        : undefined,
    },
  });

  await logAdminAction({
    actorId: session.user.id,
    action: "product.create",
    targetType: "Product",
    targetId: product.id,
  });

  revalidatePath("/backoffice/products");
  redirect("/backoffice/products");
}

export async function updateProductAction(productId: string, formData: FormData) {
  const session = await requireAdmin();
  const fields = readProductFields(formData);

  await prisma.product.update({ where: { id: productId }, data: fields });

  await logAdminAction({
    actorId: session.user.id,
    action: "product.update",
    targetType: "Product",
    targetId: productId,
  });

  revalidatePath("/backoffice/products");
  revalidatePath(`/backoffice/products/${productId}/edit`);
  revalidatePath(`/products/${productId}`);
  redirect("/backoffice/products");
}
