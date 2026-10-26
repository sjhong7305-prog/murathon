"use client";

import { useMemo, useState } from "react";
import { formatWon } from "@muraton/shared/format";

export function MusicPriceSelector({
  minPrice,
  suggestedPrice,
  onChange,
}: {
  minPrice: number;
  suggestedPrice: number;
  onChange: (price: number | null) => void;
}) {
  const presets = useMemo(() => {
    const values = new Set<number>([
      minPrice,
      suggestedPrice,
      Math.round(suggestedPrice * 1.5),
      suggestedPrice * 2,
    ]);
    return Array.from(values)
      .filter((v) => v >= minPrice)
      .sort((a, b) => a - b);
  }, [minPrice, suggestedPrice]);

  const [rawValue, setRawValue] = useState("");
  const numericValue = rawValue === "" ? null : Number(rawValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
    setRawValue(digits);
    onChange(digits === "" ? null : Number(digits));
  };

  const chooseChip = (value: number) => {
    setRawValue(String(value));
    onChange(value);
  };

  const displayValue = rawValue === "" ? "" : Number(rawValue).toLocaleString("ko-KR");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-48 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 focus-within:border-accent">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={`${suggestedPrice.toLocaleString("ko-KR")} (추천)`}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        <span className="shrink-0 text-sm text-muted">원</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => chooseChip(value)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              numericValue === value
                ? "border-accent bg-accent/20 text-accent-strong"
                : "border-line text-ink hover:border-black/20"
            }`}
          >
            {value === minPrice && minPrice === 0
              ? "0원 (무료)"
              : value === suggestedPrice
                ? `${formatWon(value)} (추천)`
                : formatWon(value)}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted">
        {minPrice === 0
          ? "원하는 만큼 후원할 수 있어요. 0원도 괜찮아요."
          : `최소 ${formatWon(minPrice)}부터 원하는 금액을 정할 수 있어요.`}
      </p>
    </div>
  );
}
