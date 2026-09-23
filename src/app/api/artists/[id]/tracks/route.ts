import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeRightsStatus, type RightsDetail, type StoryPrompts } from "@/lib/tracks-storage";
import { serializeTrack } from "@/lib/track-serialize";
import { MAX_PRICE } from "@/lib/price-validation";
import { COVER_COLORS } from "@/lib/cover-colors";

interface CreateTrackReleaseBody {
  title: string;
  artist: string;
  genre: string;
  description: string;
  imageUrl?: string;
  previewAudioUrl?: string;
  durationSec?: number;
  minPrice: number;
  suggestedPrice: number;
  rightsDetail: RightsDetail;
  storyPrompts?: StoryPrompts;
  consentConfirmedAt: string;
}

function validatePriceFields(minPrice: unknown, suggestedPrice: unknown): { ok: true; minPrice: number; suggestedPrice: number } | { ok: false; error: string } {
  const min = Number(minPrice);
  const suggested = Number(suggestedPrice);
  if (!Number.isInteger(min) || min < 0 || min > MAX_PRICE) {
    return { ok: false, error: `최소 가격은 0 ~ ${MAX_PRICE.toLocaleString("ko-KR")}원 사이여야 해요.` };
  }
  if (!Number.isInteger(suggested) || suggested < min || suggested > MAX_PRICE) {
    return { ok: false, error: "권장 가격은 최소 가격 이상이어야 해요." };
  }
  return { ok: true, minPrice: min, suggestedPrice: suggested };
}

/**
 * The self-service "음원 업로드" wizard's submit endpoint. Creates BOTH a Track row (rights
 * registration — feeds the backoffice 권리검토 queue and the free /tracks/[id] story page,
 * unchanged from before) AND a Product row (type TRACK — the real, purchasable catalog entry that
 * makes the release show up in search/catalog/the artist page). The two are deliberately not
 * linked by a foreign key, same as everywhere else in this codebase that keeps Track and
 * Product/AlbumTrack separate (see schema.prisma comments on both models) — they just happen to
 * be created from the same submission.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: artistId } = await params;
  const session = await getSession();
  if (!session || !session.user.artistMemberships.some((m) => m.artistId === artistId)) {
    return NextResponse.json({ error: "본인 아티스트 계정으로만 등록할 수 있어요." }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as CreateTrackReleaseBody | null;
  if (!body || !body.title?.trim() || !body.artist?.trim() || !body.genre?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: "제목, 아티스트명, 장르, 설명을 모두 입력해주세요." }, { status: 400 });
  }
  if (!body.consentConfirmedAt) {
    return NextResponse.json({ error: "동의 확인이 필요해요." }, { status: 400 });
  }

  const priceCheck = validatePriceFields(body.minPrice, body.suggestedPrice);
  if (!priceCheck.ok) {
    return NextResponse.json({ error: priceCheck.error }, { status: 400 });
  }

  const rightsStatus = computeRightsStatus(body.rightsDetail);
  const pricingType = priceCheck.minPrice === 0 ? "PWYW" : "FIXED";
  const coverColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

  const [track, product] = await prisma.$transaction([
    prisma.track.create({
      data: {
        artistId,
        title: body.title.trim(),
        artistNameSnapshot: body.artist.trim(),
        genre: body.genre.trim(),
        description: body.description.trim(),
        previewAudioUrl: body.previewAudioUrl || null,
        pricingType,
        minPrice: priceCheck.minPrice,
        previewLimitSeconds: 30,
        rightsStatus: rightsStatus.toUpperCase() as "CLEAR" | "PENDING_REVIEW" | "TRUST_REGISTERED",
        rightsDetail: body.rightsDetail as unknown as Prisma.InputJsonValue,
        storyPrompts: (body.storyPrompts ?? undefined) as Prisma.InputJsonValue | undefined,
        consentConfirmedAt: body.consentConfirmedAt,
      },
    }),
    prisma.product.create({
      data: {
        artistId,
        type: "TRACK",
        title: body.title.trim(),
        description: body.description.trim(),
        format: "디지털 싱글",
        genre: body.genre.trim(),
        minPrice: priceCheck.minPrice,
        suggestedPrice: priceCheck.suggestedPrice,
        coverColor,
        imageUrl: body.imageUrl || null,
        previewAudioUrl: body.previewAudioUrl || null,
        releaseDate: new Date(),
        durationSec: body.durationSec ?? null,
      },
    }),
  ]);

  return NextResponse.json({ track: serializeTrack(track), productId: product.id });
}
