import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { computeRightsStatus, type RightsDetail } from "@/lib/tracks-storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await db.orm.public.Track.first({ id });
  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(track);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const rightsDetail = body.rightsDetail as RightsDetail;
  const rightsStatus = computeRightsStatus(rightsDetail);

  const track = await db.orm.public.Track.where({ id }).update({
    rightsDetail: JSON.parse(JSON.stringify(rightsDetail)),
    rightsStatus,
  });
  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(track);
}
