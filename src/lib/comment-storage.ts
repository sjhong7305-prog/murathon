export interface Comment {
  nickname: string;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = "muraton-local-comments";

type CommentsMap = Record<string, Comment[]>;

function readMap(): CommentsMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLocalComments(productId: string): Comment[] {
  return readMap()[productId] ?? [];
}

export function addLocalComment(productId: string, nickname: string, message: string) {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return;
  const map = readMap();
  const existing = map[productId] ?? [];
  map[productId] = [
    ...existing,
    {
      nickname: nickname.trim() || "익명의 팬",
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    },
  ];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
