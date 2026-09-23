/**
 * One-off data fix: the "display" font option was removed from FONT_OPTIONS (too bold/low
 * readability, replaced by a 7-font OFL set). Any Artist.theme JSON still carrying font:"display"
 * would otherwise fail validateThemeInput() and silently reset the artist's ENTIRE theme (colors,
 * background, links — not just the font) to DEFAULT_THEME on next render, via parseArtistTheme's
 * fallback. Run once after deploying the font change: `npx tsx scripts/migrate-font-display.ts`.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  const rows = await prisma.artist.findMany({
    where: { theme: { path: ["font"], equals: "display" } },
    select: { id: true, slug: true, theme: true },
  });

  if (rows.length === 0) {
    console.log("No artists with theme.font === 'display'. Nothing to do.");
    return;
  }

  for (const row of rows) {
    const theme = row.theme as Record<string, unknown>;
    const updated = { ...theme, font: "pretendard" };
    await prisma.artist.update({ where: { id: row.id }, data: { theme: updated } });
    console.log(`Migrated ${row.slug} (${row.id}): font "display" -> "pretendard"`);
  }

  console.log(`Done. Migrated ${rows.length} artist(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
