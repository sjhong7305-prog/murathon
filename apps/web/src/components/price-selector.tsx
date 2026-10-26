"use client";

import { useMemo, useState } from "react";
import { formatWon } from "@muraton/shared/format";

export function PriceSelector({
  minPrice,
  suggestedPrice,
  onChange,
}: {
  minPrice: number;
  suggestedPrice: number;
  onChange: (price: number) => void;
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

  const [selected, setSelected] = useState<number>(suggestedPrice);
  const [customInput, setCustomInput] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const choose = (value: number) => {
    setIsCustom(false);
    setSelected(value);
    onChange(value);
  };

  const applyCustom = (raw: string) => {
    setCustomInput(raw);
    const parsed = Math.max(minPrice, Math.round(Number(raw) || 0));
    setSelected(parsed);
    onChange(parsed);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              !isCustom && selected === value
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
        <button
          type="button"
          onClick={() => setIsCustom(true)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            isCustom
              ? "border-accent bg-accent/20 text-accent-strong"
              : "border-line text-ink hover:border-black/20"
          }`}
        >
          직접 입력
        </button>
      </div>

      {isCustom && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={minPrice}
            step={100}
            value={customInput}
            onChange={(e) => applyCustom(e.target.value)}
            placeholder={`${minPrice}원 이상`}
            className="w-40 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <span className="text-sm text-muted">원</span>
        </div>
      )}

      <p className="text-xs text-muted">
        {minPrice === 0
          ? "원하는 만큼 후원할 수 있어요. 0원도 괜찮아요."
          : `최소 ${formatWon(minPrice)}부터 원하는 금액을 정할 수 있어요.`}
      </p>
    </div>
  );
}
