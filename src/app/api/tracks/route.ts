import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { computeRightsStatus, type RightsDetail } from "@/lib/tracks-storage";

export async function GET() {
  const tracks = await db.orm.public.Track.orderBy((t) => t.createdAt.desc()).all();
  return NextResponse.json(tracks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const rightsDetail = body.rightsDetail as RightsDetail;
  const rightsStatus = computeRightsStatus(rightsDetail);

  const track = await db.orm.public.Track.create({
    title: body.title,
    artist: body.artist,
    genre: body.genre,
    description: body.description,
    previewAudioUrl: body.previewAudioUrl ?? null,
    pricingType: body.pricingType,
    minPrice: body.minPrice,
    previewLimitSeconds: body.previewLimitSeconds ?? 30,
    rightsStatus,
    rightsDetail: JSON.parse(JSON.stringify(rightsDetail)),
    consentConfirmedAt: body.consentConfirmedAt,
  });

  return NextResponse.json(track, { status: 201 });
}
