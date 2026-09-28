export type BroadcastTarget = "all" | "purchased";
export type NoticeVisibility = "PUBLIC" | "SUPPORTER" | "SUBSCRIBER";

export interface BroadcastMedia {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface Broadcast {
  id: string;
  title: string | null;
  message: string;
  target: BroadcastTarget;
  visibility: NoticeVisibility;
  pinned: boolean;
  reachCount: number;
  sentAt: string;
  media: BroadcastMedia[];
}

export async function getBroadcasts(artistId: string): Promise<Broadcast[]> {
  try {
    const res = await fetch(`/api/artists/${artistId}/broadcasts`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function addBroadcast(
  artistId: string,
  broadcast: Pick<Broadcast, "title" | "message" | "target" | "visibility" | "pinned"> & {
    media: { url: string; width?: number; height?: number }[];
  }
): Promise<Broadcast> {
  const res = await fetch(`/api/artists/${artistId}/broadcasts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(broadcast),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? "공지를 보내지 못했어요.");
  }
  return data as Broadcast;
}

export async function updateBroadcast(
  artistId: string,
  broadcastId: string,
  patch: Partial<Pick<Broadcast, "title" | "message" | "visibility" | "pinned">>
): Promise<void> {
  const res = await fetch(`/api/artists/${artistId}/broadcasts/${broadcastId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? "공지를 수정하지 못했어요.");
  }
}

export async function deleteBroadcast(artistId: string, broadcastId: string): Promise<void> {
  const res = await fetch(`/api/artists/${artistId}/broadcasts/${broadcastId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "공지를 삭제하지 못했어요.");
  }
}
