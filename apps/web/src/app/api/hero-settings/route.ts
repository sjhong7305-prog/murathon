import { NextResponse } from "next/server";
import { prisma } from "@muraton/db";

export async function GET() {
  const settings = await prisma.heroSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return NextResponse.json({
    headline: settings.headline,
    subtext: settings.subtext,
    position: settings.position,
  });
}
