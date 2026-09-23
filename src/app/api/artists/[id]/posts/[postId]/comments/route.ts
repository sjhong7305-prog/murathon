import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canCommentOnArtist } from "@/lib/eligibility";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  const comments = await prisma.artistPostComment.findMany({
    where: { artistId: id, postId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    comments.map((c) => ({
      id: c.id,
      authorNickname: c.authorNickname,
      message: c.message,
      createdAt: c.createdAt,
    }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인한 팬만 댓글을 남길 수 있어요." }, { status: 401 });
  }

  const eligible = await canCommentOnArtist(session.user.id, id);
  if (!eligible) {
    return NextResponse.json(
      { error: "아티스트를 팔로우하고 최소 1건 구매해야 댓글을 남길 수 있어요." },
      { status: 403 }
    );
  }

  const { message } = await req.json();
  const trimmed = String(message ?? "").trim();
  if (!trimmed) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const comment = await prisma.artistPostComment.create({
    data: {
      postId,
      artistId: id,
      authorUserId: session.user.id,
      authorNickname: session.user.nickname,
      message: trimmed,
    },
  });

  return NextResponse.json({
    id: comment.id,
    authorNickname: comment.authorNickname,
    message: comment.message,
    createdAt: comment.createdAt,
  });
}
