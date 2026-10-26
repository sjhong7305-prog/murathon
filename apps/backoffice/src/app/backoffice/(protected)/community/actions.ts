"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { logAdminAction } from "@/lib/audit-log";

export async function deletePostAction(postId: string) {
  const session = await requireAdmin();

  await prisma.communityPost.delete({ where: { id: postId } });

  await logAdminAction({
    actorId: session.user.id,
    action: "community.post.delete",
    targetType: "CommunityPost",
    targetId: postId,
  });

  revalidatePath("/backoffice/community");
  redirect("/backoffice/community");
}

export async function deleteCommentAction(postId: string, commentId: string) {
  const session = await requireAdmin();

  await prisma.communityComment.delete({ where: { id: commentId } });

  await logAdminAction({
    actorId: session.user.id,
    action: "community.comment.delete",
    targetType: "CommunityComment",
    targetId: commentId,
  });

  revalidatePath(`/backoffice/community/${postId}`);
}
