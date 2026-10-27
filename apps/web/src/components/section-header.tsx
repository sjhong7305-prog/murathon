import Link from "next/link";

/** Home section heading: English title + Korean subtitle, with an optional "모두 보기" link. */
export function SectionHeader({
  title,
  subtitle,
  href,
  tone = "light",
}: {
  title: string;
  subtitle: string;
  href?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className={`text-2xl font-black tracking-tight ${dark ? "text-cream" : "text-ink"}`}>{title}</h2>
        <p className={`mt-1 text-sm ${dark ? "text-cream/60" : "text-muted"}`}>{subtitle}</p>
      </div>
      {href && (
        <Link
          href={href}
          className={`shrink-0 text-sm font-bold transition hover:underline ${
            dark ? "text-cream/60 hover:text-cream" : "text-muted hover:text-ink"
          }`}
        >
          모두 보기
        </Link>
      )}
    </div>
  );
}
