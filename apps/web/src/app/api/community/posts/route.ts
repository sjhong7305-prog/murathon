import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { serializeCommunityPost } from "@/lib/community-serialize";

const includeClause = {
  comments: { orderBy: { createdAt: "asc" as const } },
  attachedProduct: { include: { artist: { select: { name: true } } } },
};

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get("artistId");
  const posts = await prisma.communityPost.findMany({
    where: artistId ? { artistId } : undefined,
    orderBy: { createdAt: "desc" },
    include: includeClause,
  });
  return NextResponse.json(posts.map(serializeCommunityPost));
}

export async function POST(req: NextRequest) {
  const { title, body, author, authorType, tags, attachedProductId, artistId } = await req.json();

  const cleanedTags = Array.isArray(tags)
    ? [...new Set(tags.map((t) => String(t).trim().replace(/^#/, "")).filter(Boolean))].slice(0, 5)
    : [];

  const post = await prisma.communityPost.create({
    data: {
      title: String(title ?? "").trim(),
      body: String(body ?? "").trim(),
      authorNickname: String(author ?? "").trim() || "익명",
      authorType: authorType === "artist" ? "ARTIST" : "FOLLOWER",
      tags: cleanedTags,
      attachedProductId: attachedProductId ? String(attachedProductId) : null,
      artistId: artistId ? String(artistId) : null,
    },
    include: includeClause,
  });
  return NextResponse.json(serializeCommunityPost(post));
}
