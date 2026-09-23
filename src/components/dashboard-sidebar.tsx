"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Disc3, MessageCircle, Megaphone, Wallet, Settings, ExternalLink } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  isActive: (pathname: string, base: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "",
    label: "개요",
    icon: LayoutDashboard,
    isActive: (pathname, base) => pathname === base,
  },
  {
    href: "/releases",
    label: "릴리즈",
    icon: Disc3,
    // The upload wizards live at /dashboard/upload(/track) rather than nested under /releases,
    // but they're conceptually part of release management, so they keep this tab highlighted too.
    isActive: (pathname, base) =>
      pathname === `${base}/releases` || pathname.startsWith(`${base}/upload`),
  },
  {
    href: "/messages",
    label: "팬 메시지",
    icon: MessageCircle,
    isActive: (pathname, base) => pathname.startsWith(`${base}/messages`),
  },
  {
    href: "/notices",
    label: "공지",
    icon: Megaphone,
    isActive: (pathname, base) => pathname.startsWith(`${base}/notices`),
  },
  {
    href: "/payouts",
    label: "정산",
    icon: Wallet,
    isActive: (pathname, base) => pathname.startsWith(`${base}/payouts`),
  },
  {
    href: "/settings",
    label: "페이지 설정",
    icon: Settings,
    isActive: (pathname, base) => pathname.startsWith(`${base}/settings`),
  },
];

export function DashboardSidebar({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "";
  const base = `/artist/${slug}/dashboard`;

  const items = NAV_ITEMS.map((item) => ({
    ...item,
    fullHref: `${base}${item.href}`,
    active: item.isActive(pathname, base),
  }));

  return (
    <>
      {/* Mobile: horizontal top tabs */}
      <div className="mb-6 flex items-center gap-2 lg:hidden">
        <nav className="-mx-4 flex flex-1 gap-1 overflow-x-auto border-b border-line px-4 pb-px">
          {items.map((item) => (
            <Link
              key={item.fullHref}
              href={item.fullHref}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold transition ${
                item.active
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href={`/artists/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-px shrink-0 rounded-full border border-line p-2 text-ink transition hover:border-black/20"
          aria-label="내 페이지 보기"
        >
          <ExternalLink size={15} />
        </Link>
      </div>

      {/* Desktop: left sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-24 flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.fullHref}
              href={item.fullHref}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                item.active
                  ? "bg-accent/15 text-accent-strong"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
          <Link
            href={`/artists/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-sm font-bold text-ink transition hover:border-black/20"
          >
            <ExternalLink size={15} />
            내 페이지 보기
          </Link>
        </nav>
      </aside>
    </>
  );
}
