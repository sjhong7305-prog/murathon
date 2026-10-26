import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";
import { hasPurchasedFromArtist, isSubscribedToArtist } from "@/lib/eligibility";

async function canSeePost(userId: string, artistId: string, isOwner: boolean, visibility: string): Promise<boolean> {
  if (isOwner || visibility === "PUBLIC") return true;
  if (visibility === "SUPPORTER") return hasPurchasedFromArtist(userId, artistId);
  if (visibility === "SUBSCRIBER") return isSubscribedToArtist(userId, artistId);
  return false;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 좋아요를 남길 수 있어요." }, { status: 401 });
  }

  const post = await prisma.artistPost.findUnique({ where: { id: postId }, select: { artistId: true, visibility: true } });
  if (!post || post.artistId !== id) {
    return NextResponse.json({ error: "게시물을 찾을 수 없어요." }, { status: 404 });
  }

  const isOwner = session.user.artistMemberships.some((m) => m.artistId === id);
  const eligible = await canSeePost(session.user.id, id, isOwner, post.visibility);
  if (!eligible) {
    return NextResponse.json({ error: "볼 수 없는 게시물에는 좋아요를 남길 수 없어요." }, { status: 403 });
  }

  await prisma.artistPostLike.upsert({
    where: { postId_userId: { postId, userId: session.user.id } },
    create: { postId, userId: session.user.id },
    update: {},
  });

  const likeCount = await prisma.artistPostLike.count({ where: { postId } });
  return NextResponse.json({ liked: true, likeCount });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { postId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  await prisma.artistPostLike.deleteMany({ where: { postId, userId: session.user.id } });
  const likeCount = await prisma.artistPostLike.count({ where: { postId } });
  return NextResponse.json({ liked: false, likeCount });
}
