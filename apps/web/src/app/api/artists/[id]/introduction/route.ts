import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await prisma.artist.findUnique({
    where: { id },
    select: { introduction: true },
  });
  return NextResponse.json({ introduction: artist?.introduction ?? null });
}
