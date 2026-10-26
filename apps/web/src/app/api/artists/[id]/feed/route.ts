import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getSession } from "@/lib/auth";
import { getArtistFeedPage } from "@/lib/artist-feed";
import { CATEGORY_LABEL } from "@/lib/artist-feed-labels";
import { FEED_CONTENT_MAX_LENGTH, FEED_MAX_MEDIA_COUNT, FEED_PAGE_SIZE } from "@/lib/artist-feed-constants";
import { COS_BASE_URL } from "@/lib/cos-storage";
import type { ArtistPostCategory, ArtistPostMediaType, ArtistPostVisibility } from "@muraton/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const isOwner = Boolean(session?.user.artistMemberships.some((m) => m.artistId === id));

  const cursor = req.nextUrl.searchParams.get("cursor");
  const memberId = req.nextUrl.searchParams.get("memberId");
  const limitRaw = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 50 ? limitRaw : FEED_PAGE_SIZE;

  const page = await getArtistFeedPage(id, session?.user.id ?? null, isOwner, cursor, limit, memberId);
  return NextResponse.json(page);
}

interface MediaInput {
  type: ArtistPostMediaType;
  url: string;
  width?: number;
  height?: number;
  durationSec?: number;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const membership = session?.user.artistMemberships.find((m) => m.artistId === id);
  if (!membership) {
    return NextResponse.json({ error: "본인 아티스트 계정만 게시할 수 있어요." }, { status: 403 });
  }
  // Who posted is derived from the session's own membership row, never trusted from the client.
  const authorMemberId = membership.id;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const category = String(body.category ?? "");
  const content = String(body.content ?? "").trim().slice(0, FEED_CONTENT_MAX_LENGTH);
  const visibility = String(body.visibility ?? "PUBLIC");
  const mediaRaw = Array.isArray(body.media) ? (body.media as unknown[]) : [];

  if (!(category in CATEGORY_LABEL)) {
    return NextResponse.json({ error: "카테고리를 선택해주세요." }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }
  if (visibility !== "PUBLIC" && visibility !== "SUPPORTER" && visibility !== "SUBSCRIBER") {
    return NextResponse.json({ error: "공개 범위가 올바르지 않아요." }, { status: 400 });
  }
  if (mediaRaw.length > FEED_MAX_MEDIA_COUNT) {
    return NextResponse.json({ error: `미디어는 최대 ${FEED_MAX_MEDIA_COUNT}개까지 첨부할 수 있어요.` }, { status: 400 });
  }

  const media: MediaInput[] = [];
  for (const item of mediaRaw) {
    if (typeof item !== "object" || item === null) {
      return NextResponse.json({ error: "미디어 데이터가 올바르지 않아요." }, { status: 400 });
    }
    const m = item as Record<string, unknown>;
    if (m.type !== "IMAGE" && m.type !== "VIDEO") {
      return NextResponse.json({ error: "미디어 종류가 올바르지 않아요." }, { status: 400 });
    }
    // Media urls only ever come from our own upload endpoints (image pipeline / video presign),
    // both of which write under COS_BASE_URL — reject anything else outright.
    if (typeof m.url !== "string" || !m.url.startsWith(`${COS_BASE_URL}/feed/`)) {
      return NextResponse.json({ error: "미디어 URL이 올바르지 않아요." }, { status: 400 });
    }
    media.push({
      type: m.type,
      url: m.url,
      width: typeof m.width === "number" ? m.width : undefined,
      height: typeof m.height === "number" ? m.height : undefined,
      durationSec: typeof m.durationSec === "number" ? m.durationSec : undefined,
    });
  }

  const post = await prisma.artistPost.create({
    data: {
      artistId: id,
      category: category as ArtistPostCategory,
      content,
      visibility: visibility as ArtistPostVisibility,
      authorMemberId,
      media: {
        create: media.map((m, i) => ({
          type: m.type,
          url: m.url,
          width: m.width,
          height: m.height,
          durationSec: m.durationSec,
          position: i,
        })),
      },
    },
  });

  return NextResponse.json({ id: post.id }, { status: 201 });
}
