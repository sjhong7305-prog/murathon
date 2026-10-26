import localFont from "next/font/local";
import { Noto_Sans_KR, IBM_Plex_Sans_KR, Noto_Serif_KR, Nanum_Myeongjo, Gowun_Dodum, Gowun_Batang } from "next/font/google";
import type { FontId } from "@muraton/shared/artist-theme";

// Loaded only where an artist theme is actually rendered (themed-artist-view.tsx), never in the
// root layout — these must not affect font loading on any other page.
//
// Font licenses — all 7 are SIL Open Font License 1.1, redistribution/embedding permitted:
//   - Pretendard          OFL-1.1   https://github.com/orioncactus/pretendard (npm package "pretendard")
//   - Noto Sans KR         OFL-1.1   https://fonts.google.com/noto/specimen/Noto+Sans+KR
//   - IBM Plex Sans KR     OFL-1.1   https://fonts.google.com/specimen/IBM+Plex+Sans+KR
//   - Noto Serif KR        OFL-1.1   https://fonts.google.com/noto/specimen/Noto+Serif+KR
//   - Nanum Myeongjo       OFL-1.1   https://fonts.google.com/specimen/Nanum+Myeongjo
//   - Gowun Dodum          OFL-1.1   https://fonts.google.com/specimen/Gowun+Dodum
//   - Gowun Batang         OFL-1.1   https://fonts.google.com/specimen/Gowun+Batang
// See /licenses for the same list rendered for visitors.
//
// Body text should stick to weight 400/500; headings should never exceed 700 — so only those
// weights are loaded here (some of these fonts don't ship 500 or anything past 700 at all).

const pretendard = localFont({
  variable: "--font-artist-pretendard",
  display: "swap",
  src: [
    { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-artist-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  variable: "--font-artist-ibm-plex-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-artist-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// No 500 weight available for this family — 400/700 only.
const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-artist-nanum-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Single-weight family (400 only).
const gowunDodum = Gowun_Dodum({
  variable: "--font-artist-gowun-dodum",
  subsets: ["latin"],
  weight: "400",
});

// No 500 weight available for this family — 400/700 only.
const gowunBatang = Gowun_Batang({
  variable: "--font-artist-gowun-batang",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const ARTIST_FONT_VARIABLES = [
  pretendard.variable,
  notoSansKr.variable,
  ibmPlexSansKr.variable,
  notoSerifKr.variable,
  nanumMyeongjo.variable,
  gowunDodum.variable,
  gowunBatang.variable,
].join(" ");

const FONT_CLASS: Record<FontId, string> = {
  pretendard: "font-[family-name:var(--font-artist-pretendard)]",
  notoSansKr: "font-[family-name:var(--font-artist-noto-sans-kr)]",
  ibmPlexSansKr: "font-[family-name:var(--font-artist-ibm-plex-sans-kr)]",
  notoSerifKr: "font-[family-name:var(--font-artist-noto-serif-kr)]",
  nanumMyeongjo: "font-[family-name:var(--font-artist-nanum-myeongjo)]",
  gowunDodum: "font-[family-name:var(--font-artist-gowun-dodum)]",
  gowunBatang: "font-[family-name:var(--font-artist-gowun-batang)]",
};

export function artistFontClassName(font: FontId): string {
  return `${ARTIST_FONT_VARIABLES} ${FONT_CLASS[font]}`;
}
