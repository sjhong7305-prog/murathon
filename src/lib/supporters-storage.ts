const STORAGE_KEY = "muraton-local-supporters";

type SupportersMap = Record<string, string[]>;

function readMap(): SupportersMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLocalSupporters(artistId: string): string[] {
  return readMap()[artistId] ?? [];
}

export function addLocalSupporter(artistId: string, nickname: string) {
  const trimmed = nickname.trim();
  if (!trimmed) return;
  const map = readMap();
  const existing = map[artistId] ?? [];
  if (existing.includes(trimmed)) return;
  map[artistId] = [...existing, trimmed];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
