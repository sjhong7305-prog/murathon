import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { author, authorType, message } = await req.json();
  const trimmedMessage = String(message ?? "").trim();
  if (!trimmedMessage) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const comment = await prisma.communityComment.create({
    data: {
      postId: id,
      authorNickname: String(author ?? "").trim() || "익명",
      authorType: authorType === "artist" ? "ARTIST" : "FOLLOWER",
      message: trimmedMessage,
    },
  });

  return NextResponse.json({
    id: comment.id,
    author: comment.authorNickname,
    authorType: comment.authorType.toLowerCase() as "artist" | "follower",
    message: comment.message,
    createdAt: comment.createdAt,
  });
}
