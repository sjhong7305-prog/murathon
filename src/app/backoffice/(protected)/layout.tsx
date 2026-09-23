import { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAction } from "./actions";

export default async function BackofficeLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/backoffice" className="text-sm font-black text-ink">
            MU:RATHON Backoffice
          </Link>
          <nav className="flex gap-4 text-sm text-muted">
            <Link href="/backoffice/hero" className="hover:text-ink">
              히어로 섹션
            </Link>
            <Link href="/backoffice/orders" className="hover:text-ink">
              주문
            </Link>
            <Link href="/backoffice/tracks" className="hover:text-ink">
              권리검토
            </Link>
            <Link href="/backoffice/artists" className="hover:text-ink">
              아티스트
            </Link>
            <Link href="/backoffice/products" className="hover:text-ink">
              상품
            </Link>
            <Link href="/backoffice/community" className="hover:text-ink">
              커뮤니티
            </Link>
            <Link href="/backoffice/admins" className="hover:text-ink">
              관리자
            </Link>
          </nav>
        </div>
        <form action={logoutAction} className="flex items-center gap-3">
          <span className="text-xs text-muted">{session.user.email}</span>
          <button type="submit" className="text-sm font-semibold text-muted hover:text-ink">
            로그아웃
          </button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
