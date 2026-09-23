"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-log";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "hero");
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Uploaded files land on this process's local disk under public/uploads — fine while
 * web and backoffice share one checkout, but won't survive splitting backoffice onto
 * its own VM (see project memory). Swap for real object storage before that split.
 */
async function saveUploadedImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("이미지 파일은 8MB 이하로 업로드해주세요.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name).slice(0, 10);
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/api/uploads/hero/${filename}`;
}

async function resolveImageUrl(formData: FormData, existingImageUrl?: string): Promise<string> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    return saveUploadedImage(file);
  }

  const urlValue = String(formData.get("imageUrl") ?? "").trim();
  if (urlValue) return urlValue;
  if (existingImageUrl) return existingImageUrl;

  throw new Error("이미지를 업로드하거나 이미지 URL을 입력해주세요.");
}

function readHeroFeatureFields(formData: FormData, imageUrl: string) {
  const artistId = String(formData.get("artistId") ?? "").trim() || null;
  const customName = String(formData.get("customName") ?? "").trim() || null;

  if (!artistId && !customName) {
    throw new Error("아티스트를 선택하거나 표시 이름을 직접 입력해주세요.");
  }

  return {
    artistId,
    customName,
    customSubtitle: String(formData.get("customSubtitle") ?? "").trim() || null,
    label: String(formData.get("label") ?? "BEST_OF_WEEK") as "BEST_OF_WEEK" | "TRENDING",
    imageUrl,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createHeroFeatureAction(formData: FormData) {
  const session = await requireAdmin();
  const imageUrl = await resolveImageUrl(formData);
  const fields = readHeroFeatureFields(formData, imageUrl);

  const heroFeature = await prisma.heroFeature.create({ data: fields });

  await logAdminAction({
    actorId: session.user.id,
    action: "heroFeature.create",
    targetType: "HeroFeature",
    targetId: heroFeature.id,
  });

  revalidatePath("/backoffice/hero");
  revalidatePath("/");
  redirect("/backoffice/hero");
}

export async function updateHeroFeatureAction(heroFeatureId: string, formData: FormData) {
  const session = await requireAdmin();
  const existing = await prisma.heroFeature.findUniqueOrThrow({ where: { id: heroFeatureId } });
  const imageUrl = await resolveImageUrl(formData, existing.imageUrl);
  const fields = readHeroFeatureFields(formData, imageUrl);

  await prisma.heroFeature.update({ where: { id: heroFeatureId }, data: fields });

  await logAdminAction({
    actorId: session.user.id,
    action: "heroFeature.update",
    targetType: "HeroFeature",
    targetId: heroFeatureId,
  });

  revalidatePath("/backoffice/hero");
  revalidatePath(`/backoffice/hero/${heroFeatureId}/edit`);
  revalidatePath("/");
  redirect("/backoffice/hero");
}

const HERO_TEXT_POSITIONS = [
  "BOTTOM_LEFT",
  "BOTTOM_CENTER",
  "BOTTOM_RIGHT",
  "TOP_LEFT",
  "TOP_CENTER",
  "TOP_RIGHT",
  "CENTER",
] as const;

export async function updateHeroSettingsAction(formData: FormData) {
  const session = await requireAdmin();

  const headline = String(formData.get("headline") ?? "").trim();
  if (!headline) {
    throw new Error("헤드라인을 입력해주세요.");
  }
  const subtext = String(formData.get("subtext") ?? "").trim() || null;
  const positionValue = String(formData.get("position") ?? "BOTTOM_LEFT");
  const position = HERO_TEXT_POSITIONS.includes(positionValue as (typeof HERO_TEXT_POSITIONS)[number])
    ? (positionValue as (typeof HERO_TEXT_POSITIONS)[number])
    : "BOTTOM_LEFT";

  await prisma.heroSettings.upsert({
    where: { id: "singleton" },
    update: { headline, subtext, position },
    create: { id: "singleton", headline, subtext, position },
  });

  await logAdminAction({
    actorId: session.user.id,
    action: "heroSettings.update",
    targetType: "HeroSettings",
    targetId: "singleton",
  });

  revalidatePath("/backoffice/hero");
  revalidatePath("/");
}

export async function deleteHeroFeatureAction(heroFeatureId: string) {
  const session = await requireAdmin();

  await prisma.heroFeature.delete({ where: { id: heroFeatureId } });

  await logAdminAction({
    actorId: session.user.id,
    action: "heroFeature.delete",
    targetType: "HeroFeature",
    targetId: heroFeatureId,
  });

  revalidatePath("/backoffice/hero");
  revalidatePath("/");
}
