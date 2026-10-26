import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supporters = await prisma.supporter.findMany({
    where: { artistId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(supporters.map((s) => s.nickname));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nickname } = await req.json();
  const trimmed = String(nickname ?? "").trim();
  if (!trimmed) {
    return NextResponse.json({ error: "nickname is required" }, { status: 400 });
  }

  await prisma.supporter.upsert({
    where: { artistId_nickname: { artistId: id, nickname: trimmed } },
    update: {},
    create: { artistId: id, nickname: trimmed },
  });

  return NextResponse.json({ ok: true });
}
