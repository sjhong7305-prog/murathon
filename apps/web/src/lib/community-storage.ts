export type AuthorType = "artist" | "follower";

export interface CommunityComment {
  id: string;
  author: string;
  authorType: AuthorType;
  message: string;
  createdAt: string;
}

export interface AttachedProduct {
  id: string;
  title: string;
  type: "album" | "track" | "merch" | "ticket";
  coverColor: string;
  imageUrl?: string;
  previewAudioUrl?: string;
  suggestedPrice: number;
  artistName: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  author: string;
  authorType: AuthorType;
  tags: string[];
  attachedProduct: AttachedProduct | null;
  createdAt: string;
  comments: CommunityComment[];
}

export async function getLocalPosts(): Promise<CommunityPost[]> {
  try {
    const res = await fetch("/api/community/posts");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getPost(postId: string): Promise<CommunityPost | null> {
  try {
    const res = await fetch(`/api/community/posts/${postId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function addLocalPost(input: {
  title: string;
  body: string;
  author: string;
  authorType: AuthorType;
  tags?: string[];
  attachedProductId?: string;
  artistId?: string;
}): Promise<CommunityPost> {
  const res = await fetch("/api/community/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function addLocalComment(
  postId: string,
  input: { author: string; authorType: AuthorType; message: string }
): Promise<CommunityComment> {
  const res = await fetch(`/api/community/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}
