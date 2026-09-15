import Link from "next/link";
import { artists } from "@/lib/data";

const CATEGORIES = [
  { label: "음원", href: "/search?type=music" },
  { label: "굿즈", href: "/search?type=merch" },
  { label: "티켓", href: "/search?type=ticket" },
  { label: "커뮤니티", href: "/community" },
];

export function CategoryNav() {
  const artistLinks = artists.slice(0, 8).map((a) => ({ label: a.name, href: `/artists/${a.slug}` }));

  return (
    <nav className="flex items-center gap-6 overflow-x-auto text-base font-semibold text-muted">
      {CATEGORIES.map((c) => (
        <Link key={c.href} href={c.href} className="shrink-0 py-3 transition hover:text-ink">
          {c.label}
        </Link>
      ))}

      <div className="group relative shrink-0">
        <Link href="/artists" className="flex items-center gap-1 py-3 transition hover:text-ink">
          아티스트
          {artistLinks.length > 0 && (
            <span aria-hidden className="text-[10px]">
              ▾
            </span>
          )}
        </Link>

        {artistLinks.length > 0 && (
          <div className="invisible absolute left-0 top-full z-30 min-w-56 -translate-y-1 rounded-lg border border-line bg-surface py-2 opacity-0 shadow-lg transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            {artistLinks.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="block px-4 py-2 text-sm font-normal text-ink transition hover:bg-cream"
              >
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
