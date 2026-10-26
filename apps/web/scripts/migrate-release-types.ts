/**
 * One-off data fix: backfills Product.releaseType and each release's initial digital
 * ReleaseFormat row, now that "format" (a single free-text string like "디지털 싱글") has been
 * split into releaseType (single/ep/album) + release_formats (per-format price/stock/shipping).
 *
 * releaseType is inferred from track count: 1 -> single, 2-5 -> ep, 6+ -> album. TRACK products
 * have no AlbumTrack rows of their own (a TRACK release *is* the one track), so their count is
 * always treated as 1. ALBUM products are counted via their AlbumTrack rows (0 tracks also
 * counts as 1, same floor as inferReleaseTypeFromTrackCount()).
 *
 * The digital format row's price is seeded from the release's current suggestedPrice.
 *
 * Idempotent — skips any release that already has a releaseType/digital row set. Run once after
 * deploying the schema change: `npx tsx scripts/migrate-release-types.ts`.
 */
import { prisma } from "@muraton/db";
import { inferReleaseTypeFromTrackCount } from "@muraton/shared/release-label";
import type { ReleaseType } from "@muraton/shared/types";

async function main() {
  const releases = await prisma.product.findMany({
    where: { type: { in: ["ALBUM", "TRACK"] } },
    include: { releaseFormats: true, albumTracks: true },
  });

  if (releases.length === 0) {
    console.log("No ALBUM/TRACK products found. Nothing to do.");
    return;
  }

  const counts: Record<ReleaseType, number> = { single: 0, ep: 0, album: 0 };
  let updated = 0;
  let skipped = 0;

  for (const release of releases) {
    if (release.releaseType && release.releaseFormats.some((f) => f.format === "DIGITAL")) {
      skipped++;
      counts[release.releaseType.toLowerCase() as ReleaseType]++;
      continue;
    }

    const trackCount = release.type === "TRACK" ? 1 : release.albumTracks.length;
    const releaseType = inferReleaseTypeFromTrackCount(trackCount);
    counts[releaseType]++;

    await prisma.product.update({
      where: { id: release.id },
      data: {
        releaseType: releaseType.toUpperCase() as "SINGLE" | "EP" | "ALBUM",
        releaseFormats: release.releaseFormats.some((f) => f.format === "DIGITAL")
          ? undefined
          : {
              create: {
                format: "DIGITAL",
                price: release.suggestedPrice,
                includesDigital: true,
                shippingRequired: false,
              },
            },
      },
    });

    console.log(
      `${release.type} "${release.title}" (${release.id}): ${trackCount} track(s) -> ${releaseType}`
    );
    updated++;
  }

  console.log(`\nDone. Updated ${updated}, already migrated ${skipped}.`);
  console.log(`By releaseType — single: ${counts.single}, ep: ${counts.ep}, album: ${counts.album}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
