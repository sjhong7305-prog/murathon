export const MAX_PRICE = 1_000_000;

export type PriceValidation = { ok: true; price: number } | { ok: false; error: string };

/** Server-side price guard for any PWYW purchase — cart and checkout must both call this, never trust the client's number as-is. */
export function validatePrice(raw: unknown, minPrice: number): PriceValidation {
  const price = Number(raw);
  if (!Number.isInteger(price)) {
    return { ok: false, error: "가격은 정수여야 해요." };
  }
  if (price < minPrice) {
    return { ok: false, error: `최소 ${minPrice}원 이상이어야 해요.` };
  }
  if (price > MAX_PRICE) {
    return { ok: false, error: `가격은 ${MAX_PRICE.toLocaleString("ko-KR")}원을 넘을 수 없어요.` };
  }
  return { ok: true, price };
}
