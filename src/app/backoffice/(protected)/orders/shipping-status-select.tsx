"use client";

const SHIPPING_OPTIONS = [
  { value: "PAID", label: "결제완료" },
  { value: "SHIPPING", label: "배송중" },
  { value: "DELIVERED", label: "수령완료" },
];

export function ShippingStatusSelect({
  action,
  defaultValue,
}: {
  action: (formData: FormData) => void;
  defaultValue: string;
}) {
  return (
    <form action={action}>
      <select
        name="shippingStatus"
        defaultValue={defaultValue}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line bg-cream px-2 py-1 text-xs text-ink outline-none focus:border-accent"
      >
        {SHIPPING_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}
