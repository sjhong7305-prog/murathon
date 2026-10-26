import type { CSSProperties } from "react";
import { ArtistTheme, ensureReadableText, resolveContrastBackground } from "@muraton/shared/artist-theme";
import { artistFontClassName } from "@/lib/artist-fonts";

/**
 * Pure computation of "what does this artist's chosen theme translate to" — CSS custom
 * properties (consumed by every descendant via var(--artist-*), regardless of which tab/page
 * component renders them), the page background style, and the font className. Shared between the
 * real public route's layout.tsx and the appearance-editor's live preview so they can never drift.
 */
export function computeArtistThemeStyle(theme: ArtistTheme): {
  vars: CSSProperties;
  backgroundStyle: CSSProperties;
  fontClassName: string;
  readableCardText: string;
} {
  const { colors, background } = theme;

  const bgContrastBase = resolveContrastBackground(background, colors, colors.text);
  const readableText = ensureReadableText(bgContrastBase, colors.text);
  const readableCardText = ensureReadableText(colors.card, colors.text);

  const vars: CSSProperties = {
    "--artist-accent": colors.accent,
    "--artist-text": readableText,
    "--artist-link": colors.link,
    "--artist-card": colors.card,
    "--artist-card-text": readableCardText,
  } as CSSProperties;

  let backgroundStyle: CSSProperties = { backgroundColor: colors.background };
  if (background.type === "gradient") {
    const angleMap: Record<string, string> = {
      "to-r": "to right",
      "to-br": "to bottom right",
      "to-b": "to bottom",
      "to-bl": "to bottom left",
    };
    backgroundStyle = {
      backgroundImage: `linear-gradient(${angleMap[background.gradientAngle ?? "to-b"]}, ${colors.background}, ${background.gradientTo})`,
    };
  } else if (background.type === "image" && background.imageUrl) {
    backgroundStyle = {
      backgroundColor: background.computedMeanColor ?? colors.background,
      backgroundImage: `url(${background.imageUrl})`,
      backgroundRepeat: background.tileMode === "tile" ? "repeat" : "no-repeat",
      backgroundSize: background.tileMode === "tile" ? "auto" : "cover",
      backgroundPosition: "center",
      backgroundAttachment: background.attachment === "fixed" ? "fixed" : "scroll",
    };
  }

  return { vars, backgroundStyle, fontClassName: artistFontClassName(theme.font), readableCardText };
}
