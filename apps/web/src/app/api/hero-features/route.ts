import { NextResponse } from "next/server";
import { prisma } from "@muraton/db";

export async function GET() {
  const heroFeatures = await prisma.heroFeature.findMany({
    include: { artist: { select: { id: true, name: true, slug: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(
    heroFeatures.map((feature) => ({
      id: feature.id,
      label: feature.label,
      imageUrl: feature.imageUrl,
      name: feature.customName ?? feature.artist?.name ?? "",
      subtitle: feature.customSubtitle,
      artistSlug: feature.artist?.slug ?? null,
    }))
  );
}
