import Link from "next/link";
import type { CollectionCounts } from "@/lib/fan-profile";

const TABS: { key: "all" | "music" | "merch" | "ticket"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "music", label: "음원" },
  { key: "merch", label: "굿즈" },
  { key: "ticket", label: "티켓" },
];

export function CollectionTabs({
  userId,
  active,
  counts,
  showTicket,
}: {
  userId: string;
  active: "all" | "music" | "merch" | "ticket";
  counts: CollectionCounts;
  showTicket: boolean;
}) {
  const countFor = (key: (typeof TABS)[number]["key"]) =>
    key === "all" ? counts.all : key === "music" ? counts.music : key === "merch" ? counts.merch : counts.ticket;

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.filter((t) => t.key !== "ticket" || showTicket).map((t) => (
        <Link
          key={t.key}
          href={t.key === "all" ? `/fans/${userId}` : `/fans/${userId}?type=${t.key}`}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
            active === t.key
              ? "border-accent bg-accent text-white"
              : "border-line text-muted hover:border-black/20 hover:text-ink"
          }`}
        >
          {t.label} {countFor(t.key)}
        </Link>
      ))}
    </div>
  );
}
