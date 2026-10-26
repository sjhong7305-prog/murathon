export interface PurchaseRecord {
  productId: string;
  artistId: string;
  price: number;
  quantity: number;
  purchasedAt: string;
}

export async function getPurchases(): Promise<PurchaseRecord[]> {
  try {
    const res = await fetch("/api/orders?mine=true");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function hasPurchased(productId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/orders?productId=${encodeURIComponent(productId)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.hasPurchased);
  } catch {
    return false;
  }
}
