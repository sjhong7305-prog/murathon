export interface PurchaseRecord {
  productId: string;
  artistId: string;
  price: number;
  quantity: number;
  purchasedAt: string;
}

const STORAGE_KEY = "muraton-purchases";

function readAll(): PurchaseRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getPurchases(): PurchaseRecord[] {
  return readAll();
}

export function addPurchases(
  records: Array<Pick<PurchaseRecord, "productId" | "artistId" | "price" | "quantity">>
) {
  const existing = readAll();
  const purchasedAt = new Date().toISOString();
  const next = [...existing, ...records.map((r) => ({ ...r, purchasedAt }))];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function hasPurchased(productId: string): boolean {
  return readAll().some((r) => r.productId === productId);
}
