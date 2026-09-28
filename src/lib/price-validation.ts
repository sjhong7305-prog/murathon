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

export type PriceFieldsValidation =
  | { ok: true; minPrice: number; suggestedPrice: number }
  | { ok: false; error: string };

/** Server-side guard for a release's min/suggested price pair — shared by track create and edit. */
export function validatePriceFields(minPrice: unknown, suggestedPrice: unknown): PriceFieldsValidation {
  const min = Number(minPrice);
  const suggested = Number(suggestedPrice);
  if (!Number.isInteger(min) || min < 0 || min > MAX_PRICE) {
    return { ok: false, error: `최소 가격은 0 ~ ${MAX_PRICE.toLocaleString("ko-KR")}원 사이여야 해요.` };
  }
  if (!Number.isInteger(suggested) || suggested < min || suggested > MAX_PRICE) {
    return { ok: false, error: "권장 가격은 최소 가격 이상이어야 해요." };
  }
  return { ok: true, minPrice: min, suggestedPrice: suggested };
}
