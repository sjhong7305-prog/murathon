import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { COS_BASE_URL } from "@/lib/cos-storage";
import { BROADCAST_MAX_MEDIA_COUNT, BROADCAST_TITLE_MAX_LENGTH } from "@/lib/broadcast-constants";
import type { ArtistPostVisibility } from "@prisma/client";

interface MediaOut {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
}

function serialize(b: {
  id: string;
  title: string | null;
  message: string;
  target: "ALL" | "PURCHASED";
  visibility: ArtistPostVisibility;
  pinned: boolean;
  reachCount: number;
  sentAt: Date;
  media: { id: string; url: string; width: number | null; height: number | null; position: number }[];
}) {
  return {
    id: b.id,
    title: b.title,
    message: b.message,
    target: b.target.toLowerCase() as "all" | "purchased",
    visibility: b.visibility,
    pinned: b.pinned,
    reachCount: b.reachCount,
    sentAt: b.sentAt.toISOString(),
    media: [...b.media]
      .sort((a, z) => a.position - z.position)
      .map((m): MediaOut => ({ id: m.id, url: m.url, width: m.width, height: m.height })),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 볼 수 있어요." }, { status: 403 });
  }

  const broadcasts = await prisma.broadcast.findMany({
    where: { artistId: id },
    include: { media: true },
    orderBy: [{ pinned: "desc" }, { sentAt: "desc" }],
  });
  return NextResponse.json(broadcasts.map(serialize));
}

async function computeReachCount(artistId: string, target: "ALL" | "PURCHASED"): Promise<number> {
  if (target === "PURCHASED") {
    const items = await prisma.orderItem.findMany({
      where: { product: { artistId } },
      select: { order: { select: { buyerUserId: true } } },
    });
    const buyerIds = new Set(items.map((item) => item.order.buyerUserId).filter((id): id is string => Boolean(id)));
    return buyerIds.size;
  }

  return prisma.follow.count({ where: { artistId } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === id)) {
    return NextResponse.json({ error: "본인 아티스트 계정만 공지를 보낼 수 있어요." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim().slice(0, BROADCAST_TITLE_MAX_LENGTH);
  if (!title) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }

  const trimmed = String(body.message ?? "").trim();
  if (!trimmed) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const visibility = String(body.visibility ?? "PUBLIC");
  if (visibility !== "PUBLIC" && visibility !== "SUPPORTER" && visibility !== "SUBSCRIBER") {
    return NextResponse.json({ error: "공개 범위가 올바르지 않아요." }, { status: 400 });
  }
  const pinned = Boolean(body.pinned);

  const target = String(body.target ?? "all").toUpperCase();
  if (target !== "ALL" && target !== "PURCHASED") {
    return NextResponse.json({ error: "대상이 올바르지 않아요." }, { status: 400 });
  }

  const mediaRaw = Array.isArray(body.media) ? (body.media as unknown[]) : [];
  if (mediaRaw.length > BROADCAST_MAX_MEDIA_COUNT) {
    return NextResponse.json({ error: `이미지는 최대 ${BROADCAST_MAX_MEDIA_COUNT}장까지 첨부할 수 있어요.` }, { status: 400 });
  }
  const media: { url: string; width?: number; height?: number }[] = [];
  for (const item of mediaRaw) {
    if (typeof item !== "object" || item === null) {
      return NextResponse.json({ error: "이미지 데이터가 올바르지 않아요." }, { status: 400 });
    }
    const m = item as Record<string, unknown>;
    if (typeof m.url !== "string" || !m.url.startsWith(`${COS_BASE_URL}/broadcasts/`)) {
      return NextResponse.json({ error: "이미지 URL이 올바르지 않아요." }, { status: 400 });
    }
    media.push({
      url: m.url,
      width: typeof m.width === "number" ? m.width : undefined,
      height: typeof m.height === "number" ? m.height : undefined,
    });
  }

  const reachCount = await computeReachCount(id, target as "ALL" | "PURCHASED");

  // Pinning is "at most one per artist" — unset any existing pin and create the new row in the
  // same transaction so a concurrent request can never leave two rows pinned at once.
  const broadcast = await prisma.$transaction(async (tx) => {
    if (pinned) {
      await tx.broadcast.updateMany({ where: { artistId: id, pinned: true }, data: { pinned: false } });
    }
    return tx.broadcast.create({
      data: {
        artistId: id,
        title,
        message: trimmed,
        target: target as "ALL" | "PURCHASED",
        visibility: visibility as ArtistPostVisibility,
        pinned,
        reachCount,
        media: {
          create: media.map((m, i) => ({ url: m.url, width: m.width, height: m.height, position: i })),
        },
      },
      include: { media: true },
    });
  });

  return NextResponse.json(serialize(broadcast), { status: 201 });
}
