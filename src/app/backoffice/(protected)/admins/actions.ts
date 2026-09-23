"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-log";

export interface AdminFormState {
  error?: string;
  success?: boolean;
}

export async function createAdminAction(
  _prevState: AdminFormState | undefined,
  formData: FormData
): Promise<AdminFormState> {
  const session = await requireAdmin();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newEmail = String(formData.get("newEmail") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!newEmail || !newPassword) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const verified = await bcrypt.compare(currentPassword, session.user.passwordHash);
  if (!verified) {
    return { error: "본인 비밀번호가 일치하지 않습니다." };
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) {
    return { error: "이미 존재하는 이메일입니다." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const newAdmin = await prisma.user.create({
    data: { email: newEmail, passwordHash, isAdmin: true, nickname: newEmail.split("@")[0] },
  });

  await logAdminAction({
    actorId: session.user.id,
    action: "admin.create",
    targetType: "User",
    targetId: newAdmin.id,
    metadata: { email: newAdmin.email },
  });

  revalidatePath("/backoffice/admins");
  return { success: true };
}

export async function revokeSessionAction(sessionId: string) {
  const session = await requireAdmin();

  await prisma.session.deleteMany({ where: { id: sessionId, userId: session.user.id } });

  await logAdminAction({
    actorId: session.user.id,
    action: "admin.session.revoke",
    targetType: "Session",
    targetId: sessionId,
  });

  revalidatePath("/backoffice/admins");
}
