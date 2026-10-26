import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { serializeTrack } from "@/lib/track-serialize";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(serializeTrack(track));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.track.findUnique({ where: { id }, select: { artistId: true } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const isMember = session.user.artistMemberships.some((m) => m.artistId === existing.artistId);
  if (!isMember) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const track = await prisma.track.update({
    where: { id },
    data: {
      ...(body.rightsDetail !== undefined ? { rightsDetail: body.rightsDetail } : {}),
      ...(body.rightsStatus !== undefined
        ? {
            rightsStatus: String(body.rightsStatus).toUpperCase() as
              | "CLEAR"
              | "PENDING_REVIEW"
              | "TRUST_REGISTERED",
          }
        : {}),
    },
  });

  return NextResponse.json(serializeTrack(track));
}
