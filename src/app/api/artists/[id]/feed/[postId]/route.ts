import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deleteFromCos, parseCosKey } from "@/lib/cos-storage";
import { CATEGORY_LABEL } from "@/lib/artist-feed-labels";
import { FEED_CONTENT_MAX_LENGTH } from "@/lib/artist-feed-constants";
import type { ArtistPostCategory, ArtistPostVisibility } from "@prisma/client";

async function assertOwner(id: string, postId: string) {
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return { error: NextResponse.json({ error: "본인 아티스트 계정만 수정할 수 있어요." }, { status: 403 }) };
  }
  const post = await prisma.artistPost.findUnique({ where: { id: postId } });
  if (!post || post.artistId !== id) {
    return { error: NextResponse.json({ error: "게시물을 찾을 수 없어요." }, { status: 404 }) };
  }
  return { post };
}

// Media itself isn't editable in this route — replacing images/video means delete + repost, to
// keep the edit surface (and its validation) small. Text/category/visibility only.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  const check = await assertOwner(id, postId);
  if ("error" in check) return check.error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const category = String(body.category ?? "");
  const content = String(body.content ?? "").trim().slice(0, FEED_CONTENT_MAX_LENGTH);
  const visibility = String(body.visibility ?? "");

  if (!(category in CATEGORY_LABEL)) {
    return NextResponse.json({ error: "카테고리를 선택해주세요." }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }
  if (visibility !== "PUBLIC" && visibility !== "SUPPORTER" && visibility !== "SUBSCRIBER") {
    return NextResponse.json({ error: "공개 범위가 올바르지 않아요." }, { status: 400 });
  }

  await prisma.artistPost.update({
    where: { id: postId },
    data: {
      category: category as ArtistPostCategory,
      content,
      visibility: visibility as ArtistPostVisibility,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const { id, postId } = await params;
  const check = await assertOwner(id, postId);
  if ("error" in check) return check.error;

  const media = await prisma.artistPostMedia.findMany({ where: { postId }, select: { url: true } });
  await prisma.artistPost.delete({ where: { id: postId } });

  await Promise.all(
    media.map(async (m) => {
      const key = parseCosKey(m.url);
      if (key) await deleteFromCos(key.folder, key.filename).catch(() => {});
    })
  );

  return NextResponse.json({ ok: true });
}
