"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ARTIST_TABS = [
  { key: "home", label: "홈", suffix: "" },
  { key: "discography", label: "음원·굿즈", suffix: "/discography" },
  { key: "feed", label: "피드", suffix: "/feed" },
  { key: "community", label: "커뮤니티", suffix: "/community" },
  { key: "events", label: "공연", suffix: "/events" },
] as const;

/** Sticky, below the site header (top offset matches header+category-nav's real rendered height). */
export function ArtistTabBar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/artists/${slug}`;

  return (
    <nav
      className="sticky top-[120px] z-10 border-b"
      style={{ backgroundColor: "var(--artist-card)", borderColor: "color-mix(in srgb, var(--artist-text) 12%, transparent)" }}
    >
      <div className="scrollbar-hide mx-auto flex max-w-7xl gap-1 overflow-x-auto overscroll-x-contain px-4 md:overflow-visible">
        {ARTIST_TABS.map((t) => {
          const href = `${base}${t.suffix}`;
          const active = pathname === href;
          return (
            <Link
              key={t.key}
              href={href}
              className="shrink-0 border-b-2 px-3 py-3 text-sm font-bold transition"
              style={{
                borderColor: active ? "var(--artist-accent)" : "transparent",
                color: active ? "var(--artist-text)" : "var(--artist-card-text)",
                opacity: active ? 1 : 0.65,
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
