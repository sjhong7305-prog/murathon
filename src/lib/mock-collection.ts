import type { PurchaseRecord } from "./purchase-storage";

export const seedCollection: PurchaseRecord[] = [
  { productId: "p2", artistId: "a1", price: 32000, quantity: 1, purchasedAt: "2026-07-12T00:00:00.000Z" },
  { productId: "p5", artistId: "a3", price: 6000, quantity: 1, purchasedAt: "2026-08-01T00:00:00.000Z" },
  { productId: "p7", artistId: "a4", price: 1500, quantity: 1, purchasedAt: "2026-08-20T00:00:00.000Z" },
];
