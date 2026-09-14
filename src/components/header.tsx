"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { SearchBar } from "./search-bar";
import { CategoryNav } from "./category-nav";

export function Header() {
  const { totalCount } = useCart();
  const { session, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:gap-5">
        <Link href="/" className="shrink-0 text-lg font-black tracking-tight text-ink">
          MU:RATHON
        </Link>

        <SearchBar className="max-w-xs flex-1 sm:max-w-sm" />

        <nav className="ml-auto flex shrink-0 items-center gap-5 text-sm text-ink">
          {session === "artist" && (
            <>
              <Link href="/mypage/artist" className="hidden hover:text-accent-strong lg:inline">
                아티스트 마이페이지
              </Link>
              <Link href="/dashboard" className="hidden hover:text-accent-strong sm:inline">
                아티스트 대시보드
              </Link>
            </>
          )}

          {session === "follower" && (
            <Link href="/mypage/follower" className="hidden hover:text-accent-strong sm:inline">
              팔로워 마이페이지
            </Link>
          )}

          {session === null && (
            <>
              <Link href="/login" className="hidden hover:text-accent-strong sm:inline">
                로그인
              </Link>
              <Link href="/signup" className="hover:text-accent-strong">
                회원가입
              </Link>
            </>
          )}

          {session !== null && (
            <button type="button" onClick={handleLogout} className="hover:text-accent-strong">
              로그아웃
            </button>
          )}

          <Link href="/cart" className="relative flex items-center gap-1 hover:text-accent-strong">
            장바구니
            {totalCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white">
                {totalCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4">
          <CategoryNav />
        </div>
      </div>
    </header>
  );
}
