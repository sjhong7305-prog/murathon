export interface Comment {
  nickname: string;
  message: string;
  createdAt: string;
}

export async function getLocalComments(productId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`/api/products/${productId}/comments`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function addLocalComment(
  productId: string,
  message: string
): Promise<Comment | null> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return null;
  try {
    const res = await fetch(`/api/products/${productId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmedMessage }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
