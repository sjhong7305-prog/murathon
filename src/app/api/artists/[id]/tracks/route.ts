import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeRightsStatus, type RightsDetail, type StoryPrompts } from "@/lib/tracks-storage";
import { serializeTrack } from "@/lib/track-serialize";
import { validatePriceFields } from "@/lib/price-validation";
import { COVER_COLORS } from "@/lib/cover-colors";
import type { ReleaseType } from "@/lib/types";

const RELEASE_TYPES: ReleaseType[] = ["single", "ep", "album"];

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
  releaseType: ReleaseType;
  rightsDetail: RightsDetail;
  storyPrompts?: StoryPrompts;
  consentConfirmedAt: string;
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
  if (!RELEASE_TYPES.includes(body.releaseType)) {
    return NextResponse.json({ error: "릴리즈 유형을 선택해주세요." }, { status: 400 });
  }

  const priceCheck = validatePriceFields(body.minPrice, body.suggestedPrice);
  if (!priceCheck.ok) {
    return NextResponse.json({ error: priceCheck.error }, { status: 400 });
  }

  const rightsStatus = computeRightsStatus(body.rightsDetail);
  const pricingType = priceCheck.minPrice === 0 ? "PWYW" : "FIXED";
  const coverColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

  const [track, product] = await prisma.$transaction(async (tx) => {
    const track = await tx.track.create({
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
    });
    const product = await tx.product.create({
      data: {
        artistId,
        type: "TRACK",
        title: body.title.trim(),
        description: body.description.trim(),
        releaseType: body.releaseType.toUpperCase() as "SINGLE" | "EP" | "ALBUM",
        genre: body.genre.trim(),
        minPrice: priceCheck.minPrice,
        suggestedPrice: priceCheck.suggestedPrice,
        coverColor,
        imageUrl: body.imageUrl || null,
        previewAudioUrl: body.previewAudioUrl || null,
        releaseDate: new Date(),
        durationSec: body.durationSec ?? null,
        releaseFormats: {
          create: {
            format: "DIGITAL",
            price: priceCheck.suggestedPrice,
            includesDigital: true,
            shippingRequired: false,
          },
        },
      },
    });
    return [track, product] as const;
  });

  return NextResponse.json({ track: serializeTrack(track), productId: product.id });
}
