const STORAGE_KEY = "muraton-artist-introductions";

type IntroductionMap = Record<string, string>;

function readMap(): IntroductionMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLocalIntroduction(artistId: string): string | null {
  return readMap()[artistId] ?? null;
}

export function setLocalIntroduction(artistId: string, introduction: string) {
  const map = readMap();
  map[artistId] = introduction;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
