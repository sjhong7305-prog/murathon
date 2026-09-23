import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({ data: params });
}
