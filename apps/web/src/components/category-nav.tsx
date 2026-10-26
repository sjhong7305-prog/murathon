"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { label: "음원", href: "/search?type=music" },
  { label: "굿즈", href: "/search?type=merch" },
  { label: "티켓", href: "/search?type=ticket" },
  { label: "커뮤니티", href: "/community" },
];

const ARTIST_LINKS = [
  { label: "원더 스태틱 (Wonder Static)", href: "/artists/wonder-static" },
  { label: "가산유스 (Gasan Youth)", href: "/artists/gasan-youth" },
  { label: "해파리 (Haepari)", href: "/artists/haepari" },
  { label: "열대야 (Yeoldaeya)", href: "/artists/yeoldae" },
];

function CategoryNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMusicPage = pathname === "/search" && searchParams.get("type") === "music";

  // The music page focuses on music content only — no category tabs there.
  if (isMusicPage) return null;

  return (
    <div className="border-t border-line">
      <div className="mx-auto max-w-7xl px-4">
        <nav className="scrollbar-hide flex items-center gap-6 overflow-x-auto overscroll-x-contain text-base font-semibold text-muted md:overflow-visible">
          {CATEGORIES.map((c) => (
            <Link key={c.href} href={c.href} className="shrink-0 py-3 transition hover:text-ink">
              {c.label}
            </Link>
          ))}

          <div className="group relative shrink-0">
            <Link href="/artists" className="flex items-center gap-1 py-3 transition hover:text-ink">
              아티스트
              <span aria-hidden className="text-[10px]">
                ▾
              </span>
            </Link>

            <div className="invisible absolute left-0 top-full z-30 min-w-56 -translate-y-1 rounded-lg border border-line bg-surface py-2 opacity-0 shadow-lg transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {ARTIST_LINKS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="block px-4 py-2 text-sm font-normal text-ink transition hover:bg-cream"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function CategoryNav() {
  return (
    <Suspense fallback={null}>
      <CategoryNavInner />
    </Suspense>
  );
}
