/** Best-effort Hangul → Latin romanization (Revised Romanization tables, no consonant-assimilation
 * rules) used to suggest a page address from an artist's 활동명. Non-Hangul letters/digits pass
 * through lowercased; anything else becomes a hyphen, same as a plain slugify. */

const CHO = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const JUNG = [
  "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo",
  "u", "wo", "we", "wi", "yu", "eu", "ui", "i",
];
const JONG = [
  "", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l",
  "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t",
];

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;

function romanizeSyllable(code: number): string {
  const offset = code - HANGUL_BASE;
  const jongIdx = offset % 28;
  const jungIdx = ((offset - jongIdx) / 28) % 21;
  const choIdx = (offset - jongIdx) / 28 / 21;
  return CHO[choIdx] + JUNG[jungIdx] + JONG[jongIdx];
}

export function suggestAddress(name: string): string {
  let out = "";
  for (const ch of name) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      out += romanizeSyllable(code);
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch.toLowerCase();
    } else {
      out += "-";
    }
  }
  return out.replace(/-+/g, "-").replace(/(^-|-$)/g, "");
}
