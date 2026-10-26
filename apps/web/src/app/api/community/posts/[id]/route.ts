import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { serializeCommunityPost } from "@/lib/community-serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "asc" } },
      attachedProduct: { include: { artist: { select: { name: true } } } },
    },
  });
  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(serializeCommunityPost(post));
}
