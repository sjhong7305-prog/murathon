import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";

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
  const { nickname, message } = await req.json();
  const trimmedMessage = String(message ?? "").trim();
  if (!trimmedMessage) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const comment = await prisma.productComment.create({
    data: {
      productId: id,
      nickname: String(nickname ?? "").trim() || "익명의 팬",
      message: trimmedMessage,
    },
  });

  return NextResponse.json({
    nickname: comment.nickname,
    message: comment.message,
    createdAt: comment.createdAt,
  });
}
