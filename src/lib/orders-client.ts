export interface CreateOrderInput {
  cheerMessage?: string;
  promptQuestion?: string;
  promptAnswer?: string;
  listAsSupporter: boolean;
  primaryArtistId?: string;
  total: number;
  items: Array<{ productId: string; artistId: string; price: number; quantity: number }>;
}

export async function createOrder(input: CreateOrderInput) {
  await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
