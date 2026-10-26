import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { serializeTrack } from "@/lib/track-serialize";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get("artistId");

  const tracks = await prisma.track.findMany({
    where: artistId ? { artistId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tracks.map(serializeTrack));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const isMember = session.user.artistMemberships.some((m) => m.artistId === body.artistId);
  if (!isMember) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const track = await prisma.track.create({
    data: {
      artistId: body.artistId,
      title: body.title,
      artistNameSnapshot: body.artist,
      genre: body.genre,
      description: body.description,
      previewAudioUrl: body.previewAudioUrl || null,
      pricingType: String(body.pricingType).toUpperCase() as "PWYW" | "FIXED",
      minPrice: body.minPrice,
      previewLimitSeconds: body.previewLimitSeconds ?? 30,
      rightsStatus: String(body.rightsStatus).toUpperCase() as
        | "CLEAR"
        | "PENDING_REVIEW"
        | "TRUST_REGISTERED",
      rightsDetail: body.rightsDetail,
      storyPrompts: body.storyPrompts ?? undefined,
      consentConfirmedAt: body.consentConfirmedAt,
    },
  });

  return NextResponse.json(serializeTrack(track));
}
