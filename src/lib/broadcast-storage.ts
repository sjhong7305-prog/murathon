export type BroadcastTarget = "all" | "amount" | "region";

export interface Broadcast {
  id: string;
  message: string;
  target: BroadcastTarget;
  targetDetail?: string;
  sentAt: string;
}

const STORAGE_KEY = "muraton-broadcasts";

type BroadcastMap = Record<string, Broadcast[]>;

function readMap(): BroadcastMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getBroadcasts(artistId: string): Broadcast[] {
  return readMap()[artistId] ?? [];
}

export function addBroadcast(
  artistId: string,
  broadcast: Pick<Broadcast, "message" | "target" | "targetDetail">
) {
  const map = readMap();
  const existing = map[artistId] ?? [];
  const entry: Broadcast = {
    id: `BC-${Date.now().toString(36).toUpperCase()}`,
    sentAt: new Date().toISOString(),
    ...broadcast,
  };
  map[artistId] = [entry, ...existing];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return entry;
}
