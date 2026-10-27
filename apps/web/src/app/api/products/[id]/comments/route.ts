import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.productComment.findMany({
    where: { productId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    comments.map((c) => ({ nickname: c.nickname, message: c.message, createdAt: c.createdAt }))
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The comment is always posted under the account's own nickname; the client can't pick one.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인해야 댓글을 남길 수 있어요." }, { status: 401 });
  }
  const { message } = await req.json();
  const trimmedMessage = String(message ?? "").trim();
  if (!trimmedMessage) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const comment = await prisma.productComment.create({
    data: {
      productId: id,
      authorUserId: session.user.id,
      nickname: session.user.nickname,
      message: trimmedMessage,
    },
  });

  return NextResponse.json({
    nickname: comment.nickname,
    message: comment.message,
    createdAt: comment.createdAt,
  });
}
