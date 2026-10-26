import type { Prisma } from "@muraton/db";
import { prisma } from "@muraton/db";

export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({ data: params });
}
