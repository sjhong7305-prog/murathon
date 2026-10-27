import { NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { getLatestTrackByArtists } from "@/lib/data";

export async function GET() {
  const heroFeatures = await prisma.heroFeature.findMany({
    include: { artist: { select: { id: true, name: true, slug: true } } },
    orderBy: { sortOrder: "asc" },
  });

  // Each slide's "대표곡 듣기" button plays that artist's newest release.
  const artistIds = heroFeatures.flatMap((feature) => (feature.artist ? [feature.artist.id] : []));
  const tracks = await getLatestTrackByArtists(artistIds);

  return NextResponse.json(
    heroFeatures.map((feature) => ({
      id: feature.id,
      label: feature.label,
      imageUrl: feature.imageUrl,
      name: feature.customName ?? feature.artist?.name ?? "",
      subtitle: feature.customSubtitle,
      artistSlug: feature.artist?.slug ?? null,
      track: (feature.artist && tracks.get(feature.artist.id)) ?? null,
    }))
  );
}
