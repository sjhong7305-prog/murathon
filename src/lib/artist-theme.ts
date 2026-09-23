/**
 * Pure, dependency-free theme logic for artist page customization. Importable from both server
 * (API route, page.tsx) and client (appearance-editor.tsx) code — no server-only imports here.
 */

export type ThemeMode = "light" | "dark";
export type FontId =
  | "pretendard"
  | "notoSansKr"
  | "ibmPlexSansKr"
  | "notoSerifKr"
  | "nanumMyeongjo"
  | "gowunDodum"
  | "gowunBatang";
export type DiscographyLayout = "grid" | "list";
export type BackgroundType = "solid" | "gradient" | "image";
export type TileMode = "tile" | "cover";
export type AttachmentMode = "fixed" | "scroll";
export type GradientAngle = "to-r" | "to-br" | "to-b" | "to-bl";

export interface ArtistThemeLink {
  label: string;
  url: string;
}

export interface ArtistThemeColors {
  accent: string;
  text: string;
  link: string;
  card: string;
  background: string;
}

export interface ArtistThemeBackground {
  type: BackgroundType;
  gradientTo?: string;
  gradientAngle?: GradientAngle;
  imageUrl?: string;
  tileMode?: TileMode;
  attachment?: AttachmentMode;
  /** Server-computed (sharp stats) mean color of an uploaded background image — never a user-typed field. */
  computedMeanColor?: string;
}

export interface ArtistTheme {
  mode: ThemeMode;
  font: FontId;
  discographyLayout: DiscographyLayout;
  colors: ArtistThemeColors;
  background: ArtistThemeBackground;
  links: ArtistThemeLink[];
}

export const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

// 7 fonts, all SIL Open Font License — full license/source info in artist-fonts.ts and /licenses.
export const FONT_OPTIONS: { id: FontId; label: string }[] = [
  { id: "pretendard", label: "Pretendard (산세리프 · 기본값)" },
  { id: "notoSansKr", label: "Noto Sans KR (산세리프)" },
  { id: "ibmPlexSansKr", label: "IBM Plex Sans KR (산세리프)" },
  { id: "notoSerifKr", label: "Noto Serif KR (세리프)" },
  { id: "nanumMyeongjo", label: "Nanum Myeongjo (명조)" },
  { id: "gowunDodum", label: "Gowun Dodum (부드러운 산세리프)" },
  { id: "gowunBatang", label: "Gowun Batang (부드러운 명조)" },
];

export const GRADIENT_ANGLES: { id: GradientAngle; label: string }[] = [
  { id: "to-r", label: "→ 가로" },
  { id: "to-br", label: "↘ 대각선" },
  { id: "to-b", label: "↓ 세로" },
  { id: "to-bl", label: "↙ 역대각선" },
];

export const DEFAULT_THEME: ArtistTheme = {
  mode: "light",
  font: "pretendard",
  discographyLayout: "grid",
  colors: {
    accent: "#8b75d7",
    text: "#2a2a2a",
    link: "#6b4fa8",
    card: "#ffffff",
    background: "#f9f9f7",
  },
  background: { type: "solid" },
  links: [],
};

export interface ThemePreset {
  id: string;
  label: string;
  theme: ArtistTheme;
}

export const PRESETS: ThemePreset[] = [
  {
    id: "basic",
    label: "베이직",
    theme: DEFAULT_THEME,
  },
  {
    id: "dark-minimal",
    label: "다크 미니멀",
    theme: {
      mode: "dark",
      font: "pretendard",
      discographyLayout: "list",
      colors: {
        accent: "#8b75d7",
        text: "#f2f2f2",
        link: "#b8a6ef",
        card: "#1c1c1e",
        background: "#0b0b0d",
      },
      background: { type: "solid" },
      links: [],
    },
  },
  {
    id: "paper",
    label: "페이퍼",
    theme: {
      mode: "light",
      font: "notoSerifKr",
      discographyLayout: "grid",
      colors: {
        accent: "#a9713f",
        text: "#2b2118",
        link: "#8a5a2b",
        card: "#fbf6ec",
        background: "#f3ead8",
      },
      background: { type: "solid" },
      links: [],
    },
  },
  {
    id: "neon",
    label: "네온",
    theme: {
      mode: "dark",
      font: "pretendard",
      discographyLayout: "grid",
      colors: {
        accent: "#ff2ec4",
        text: "#f5f5ff",
        link: "#5ef1ff",
        card: "#160a24",
        background: "#0a0414",
      },
      background: { type: "gradient", gradientTo: "#1a0b33", gradientAngle: "to-br" },
      links: [],
    },
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #RRGGBB colors, in [1, 21]. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
  }
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const AA_THRESHOLD = 4.5;

/**
 * Returns a text color that reads at >=4.5:1 against bgHex. Respects the artist's chosen
 * textHex when it already passes; otherwise nudges its HSL lightness toward the direction that
 * improves contrast, and — since pure black or white against any background always clears
 * 4.5:1 (the worst case, at background luminance ~0.179, is ~4.58:1) — falls back to whichever
 * of #000000/#ffffff contrasts better if the nudge doesn't converge.
 */
export function ensureReadableText(bgHex: string, textHex: string): string {
  if (contrastRatio(bgHex, textHex) >= AA_THRESHOLD) return textHex;

  const [r, g, b] = hexToRgb(textHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const bgLum = relativeLuminance(bgHex);
  const textLum = relativeLuminance(textHex);
  const direction = bgLum > textLum ? -1 : 1; // move away from the background's luminance

  let candidate = l;
  for (let i = 0; i < 50; i++) {
    candidate = Math.min(1, Math.max(0, candidate + direction * 0.02));
    const hex = hslToHex(h, s, candidate);
    if (contrastRatio(bgHex, hex) >= AA_THRESHOLD) return hex;
    if (candidate === 0 || candidate === 1) break;
  }

  const blackContrast = contrastRatio(bgHex, "#000000");
  const whiteContrast = contrastRatio(bgHex, "#ffffff");
  return blackContrast >= whiteContrast ? "#000000" : "#ffffff";
}

/**
 * The single "what color is the page background, for contrast-checking purposes" resolver —
 * used by validateThemeInput's warning, the render-time auto-correction, and the editor's live
 * warning, so all three can never disagree. For a gradient, returns whichever endpoint contrasts
 * worse against textHex (the safer bound); for an image, uses the server-computed mean color
 * when available, else falls back to colors.background.
 */
export function resolveContrastBackground(
  background: ArtistThemeBackground,
  colors: ArtistThemeColors,
  textHex: string
): string {
  if (background.type === "gradient" && background.gradientTo) {
    return contrastRatio(colors.background, textHex) <= contrastRatio(background.gradientTo, textHex)
      ? colors.background
      : background.gradientTo;
  }
  if (background.type === "image") {
    return background.computedMeanColor ?? colors.background;
  }
  return colors.background;
}

/** http(s)-only guard for any user-supplied URL rendered as an href (new theme links and legacy sns/youtube/website columns alike). */
export function safeHref(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
    return undefined;
  } catch {
    return undefined;
  }
}

export const MAX_BIO_LENGTH = 2000;
export const MAX_LINKS = 5;
export const MAX_LINK_LABEL_LENGTH = 30;

export type ValidateThemeResult =
  | { ok: true; theme: ArtistTheme; contrastWarning?: string }
  | { ok: false; error: string };

function isHex(v: unknown): v is string {
  return typeof v === "string" && HEX_COLOR_RE.test(v);
}

/**
 * The single server-side authority for what can land in Artist.theme. Every color is locked to
 * strict #RRGGBB (rejects named colors, rgb()/hsl() functions, and any script-injection-shaped
 * string outright), every enum field is whitelist-matched, and every link URL must parse as
 * http(s). Never construct an ArtistTheme any other way before writing to the DB.
 */
export function validateThemeInput(raw: unknown, serverImageUrl?: { imageUrl?: string; computedMeanColor?: string }): ValidateThemeResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "테마 데이터 형식이 올바르지 않아요." };
  }
  const r = raw as Record<string, unknown>;

  if (r.mode !== "light" && r.mode !== "dark") {
    return { ok: false, error: "테마 모드는 light 또는 dark여야 해요." };
  }
  if (!FONT_OPTIONS.some((f) => f.id === r.font)) {
    return { ok: false, error: "지원하지 않는 글꼴이에요." };
  }
  if (r.discographyLayout !== "grid" && r.discographyLayout !== "list") {
    return { ok: false, error: "디스코그래피 레이아웃은 grid 또는 list여야 해요." };
  }

  const colorsRaw = r.colors;
  if (typeof colorsRaw !== "object" || colorsRaw === null) {
    return { ok: false, error: "색상 데이터가 올바르지 않아요." };
  }
  const c = colorsRaw as Record<string, unknown>;
  for (const key of ["accent", "text", "link", "card", "background"] as const) {
    if (!isHex(c[key])) {
      return { ok: false, error: "색상은 #RRGGBB 형식이어야 해요." };
    }
  }
  const colors: ArtistThemeColors = {
    accent: c.accent as string,
    text: c.text as string,
    link: c.link as string,
    card: c.card as string,
    background: c.background as string,
  };

  const bgRaw = r.background;
  if (typeof bgRaw !== "object" || bgRaw === null) {
    return { ok: false, error: "배경 데이터가 올바르지 않아요." };
  }
  const bg = bgRaw as Record<string, unknown>;
  if (bg.type !== "solid" && bg.type !== "gradient" && bg.type !== "image") {
    return { ok: false, error: "배경 종류가 올바르지 않아요." };
  }
  const background: ArtistThemeBackground = { type: bg.type };
  if (bg.type === "gradient") {
    if (!isHex(bg.gradientTo)) {
      return { ok: false, error: "그라데이션 색상은 #RRGGBB 형식이어야 해요." };
    }
    if (!GRADIENT_ANGLES.some((a) => a.id === bg.gradientAngle)) {
      return { ok: false, error: "그라데이션 방향이 올바르지 않아요." };
    }
    background.gradientTo = bg.gradientTo as string;
    background.gradientAngle = bg.gradientAngle as GradientAngle;
  }
  if (bg.type === "image") {
    const imageUrl = serverImageUrl?.imageUrl ?? (typeof bg.imageUrl === "string" ? bg.imageUrl : undefined);
    if (!imageUrl) {
      return { ok: false, error: "배경 이미지를 업로드해주세요." };
    }
    if (bg.tileMode !== "tile" && bg.tileMode !== "cover") {
      return { ok: false, error: "배경 이미지 표시 방식이 올바르지 않아요." };
    }
    if (bg.attachment !== "fixed" && bg.attachment !== "scroll") {
      return { ok: false, error: "배경 이미지 고정 여부가 올바르지 않아요." };
    }
    const meanColor =
      serverImageUrl?.computedMeanColor ?? (typeof bg.computedMeanColor === "string" ? bg.computedMeanColor : undefined);
    if (meanColor && !isHex(meanColor)) {
      return { ok: false, error: "배경 이미지 색상 분석에 실패했어요." };
    }
    background.imageUrl = imageUrl;
    background.tileMode = bg.tileMode as TileMode;
    background.attachment = bg.attachment as AttachmentMode;
    if (meanColor) background.computedMeanColor = meanColor;
  }

  const linksRaw = r.links;
  if (!Array.isArray(linksRaw)) {
    return { ok: false, error: "링크 데이터가 올바르지 않아요." };
  }
  if (linksRaw.length > MAX_LINKS) {
    return { ok: false, error: `링크는 최대 ${MAX_LINKS}개까지 등록할 수 있어요.` };
  }
  const links: ArtistThemeLink[] = [];
  for (const item of linksRaw) {
    if (typeof item !== "object" || item === null) {
      return { ok: false, error: "링크 데이터가 올바르지 않아요." };
    }
    const li = item as Record<string, unknown>;
    const label = typeof li.label === "string" ? li.label.trim() : "";
    const url = typeof li.url === "string" ? li.url.trim() : "";
    if (!label || label.length > MAX_LINK_LABEL_LENGTH) {
      return { ok: false, error: `링크 이름은 1~${MAX_LINK_LABEL_LENGTH}자여야 해요.` };
    }
    if (!safeHref(url)) {
      return { ok: false, error: `"${label}" 링크는 http:// 또는 https:// 주소여야 해요.` };
    }
    links.push({ label, url });
  }

  const theme: ArtistTheme = {
    mode: r.mode,
    font: r.font as FontId,
    discographyLayout: r.discographyLayout,
    colors,
    background,
    links,
  };

  const ratio = contrastRatio(resolveContrastBackground(background, colors, colors.text), colors.text);
  const contrastWarning =
    ratio < AA_THRESHOLD
      ? `현재 배경/텍스트 대비가 ${ratio.toFixed(1)}:1이에요 (권장 4.5:1 이상). 방문자에게는 자동으로 보정된 색상이 표시돼요.`
      : undefined;

  return { ok: true, theme, contrastWarning };
}

/**
 * Safe read-path parse for the Artist.theme DB column: re-validates (the column is unstructured
 * Json, and nothing guarantees a row written before a validation-rule change still passes) and
 * falls back to DEFAULT_THEME rather than ever rendering an unvalidated value.
 */
export function parseArtistTheme(raw: unknown): ArtistTheme {
  if (typeof raw !== "object" || raw === null) return DEFAULT_THEME;
  const bg = (raw as Record<string, unknown>).background;
  const bgObj = typeof bg === "object" && bg !== null ? (bg as Record<string, unknown>) : {};
  const result = validateThemeInput(raw, {
    imageUrl: typeof bgObj.imageUrl === "string" ? bgObj.imageUrl : undefined,
    computedMeanColor: typeof bgObj.computedMeanColor === "string" ? bgObj.computedMeanColor : undefined,
  });
  return result.ok ? result.theme : DEFAULT_THEME;
}
