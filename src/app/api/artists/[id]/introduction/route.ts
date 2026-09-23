import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await prisma.artist.findUnique({
    where: { id },
    select: { introduction: true },
  });
  return NextResponse.json({ introduction: artist?.introduction ?? null });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { introduction } = await req.json();

  const artist = await prisma.artist.update({
    where: { id },
    data: { introduction: String(introduction ?? "") },
  });

  return NextResponse.json({ introduction: artist.introduction });
}
