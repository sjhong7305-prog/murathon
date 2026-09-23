import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { deleteFromCos, parseCosKey } from "@/lib/cos-storage";
import { BROADCAST_TITLE_MAX_LENGTH } from "@/lib/broadcast-constants";
import type { ArtistPostVisibility } from "@prisma/client";

async function assertOwner(id: string, broadcastId: string) {
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return { error: NextResponse.json({ error: "본인 아티스트 계정만 수정할 수 있어요." }, { status: 403 }) };
  }
  const broadcast = await prisma.broadcast.findUnique({ where: { id: broadcastId } });
  if (!broadcast || broadcast.artistId !== id) {
    return { error: NextResponse.json({ error: "공지를 찾을 수 없어요." }, { status: 404 }) };
  }
  return { broadcast };
}

// Media isn't editable here — same "delete + repost" rule as the feed's edit route.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; broadcastId: string }> }
) {
  const { id, broadcastId } = await params;
  const check = await assertOwner(id, broadcastId);
  if ("error" in check) return check.error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const data: {
    title?: string;
    message?: string;
    visibility?: ArtistPostVisibility;
    pinned?: boolean;
  } = {};

  if ("title" in body) {
    const title = String(body.title ?? "").trim().slice(0, BROADCAST_TITLE_MAX_LENGTH);
    if (!title) return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
    data.title = title;
  }
  if ("message" in body) {
    const message = String(body.message ?? "").trim();
    if (!message) return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    data.message = message;
  }
  if ("visibility" in body) {
    const visibility = String(body.visibility ?? "");
    if (visibility !== "PUBLIC" && visibility !== "SUPPORTER" && visibility !== "SUBSCRIBER") {
      return NextResponse.json({ error: "공개 범위가 올바르지 않아요." }, { status: 400 });
    }
    data.visibility = visibility as ArtistPostVisibility;
  }
  if ("pinned" in body) {
    data.pinned = Boolean(body.pinned);
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (data.pinned) {
      await tx.broadcast.updateMany({
        where: { artistId: id, pinned: true, id: { not: broadcastId } },
        data: { pinned: false },
      });
    }
    return tx.broadcast.update({ where: { id: broadcastId }, data });
  });

  return NextResponse.json({ ok: true, pinned: updated.pinned });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; broadcastId: string }> }
) {
  const { id, broadcastId } = await params;
  const check = await assertOwner(id, broadcastId);
  if ("error" in check) return check.error;

  const media = await prisma.broadcastMedia.findMany({ where: { broadcastId }, select: { url: true } });
  await prisma.broadcast.delete({ where: { id: broadcastId } });

  await Promise.all(
    media.map(async (m) => {
      const key = parseCosKey(m.url);
      if (key) await deleteFromCos(key.folder, key.filename).catch(() => {});
    })
  );

  return NextResponse.json({ ok: true });
}
