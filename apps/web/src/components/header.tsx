"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { SearchBar } from "./search-bar";
import { CategoryNav } from "./category-nav";

export function Header() {
  const { totalCount } = useCart();
  const { isLoggedIn, nickname, artists, activeArtist, switchToFan, switchToArtist, logout } =
    useAuth();
  const router = useRouter();
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSwitchToFan = async () => {
    setModeMenuOpen(false);
    await switchToFan();
    router.push("/");
  };

  const handleSwitchToArtist = async (artistId: string, slug: string) => {
    setModeMenuOpen(false);
    await switchToArtist(artistId);
    router.push(`/artist/${slug}/dashboard`);
  };

  return (
    <header className="sticky top-0 z-20 bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="MU:RATHON" width={983} height={556} className="h-8 w-auto" priority />
          <span className="hidden text-lg font-black tracking-tight text-ink sm:inline">MU:RATHON</span>
        </Link>

        <SearchBar className="max-w-xs flex-1 sm:max-w-sm" />

        <nav className="ml-auto flex shrink-0 items-center gap-5 text-sm text-ink">
          {isLoggedIn && activeArtist && (
            <>
              <Link
                href={`/artist/${activeArtist.slug}/dashboard`}
                className="hidden hover:text-accent-strong sm:inline"
              >
                아티스트 대시보드
              </Link>
              <Link
                href={`/artists/${activeArtist.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden hover:text-accent-strong lg:inline"
              >
                내 페이지 보기
              </Link>
            </>
          )}

          {isLoggedIn && !activeArtist && (
            <>
              <Link href="/mypage/follower" className="hidden hover:text-accent-strong sm:inline">
                내 컬렉션
              </Link>
              <Link href="/feed" className="hidden hover:text-accent-strong sm:inline">
                피드
              </Link>
              <Link href="/activity" className="hidden hover:text-accent-strong lg:inline">
                활동
              </Link>
            </>
          )}

          {isLoggedIn && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setModeMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full bg-tone px-3.5 py-1.5 font-semibold transition-colors hover:bg-line"
              >
                <span className="max-w-[8rem] truncate">
                  {activeArtist ? activeArtist.name : nickname ?? "내 계정"}
                </span>
              </button>

              {modeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setModeMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-surface p-1.5 shadow-[0_16px_40px_rgba(28,27,24,0.14)]">
                    <button
                      type="button"
                      onClick={handleSwitchToFan}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-cream ${
                        !activeArtist ? "text-accent-strong" : "text-ink"
                      }`}
                    >
                      팬 모드
                    </button>

                    {artists.length > 0 && (
                      <div className="my-1 border-t border-line" />
                    )}
                    {artists.map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => handleSwitchToArtist(artist.id, artist.slug)}
                        className={`flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-cream ${
                          activeArtist?.id === artist.id ? "text-accent-strong" : "text-ink"
                        }`}
                      >
                        {artist.name}
                      </button>
                    ))}

                    {activeArtist && (
                      <Link
                        href={`/artists/${activeArtist.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setModeMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-cream"
                      >
                        내 아티스트 페이지 보기
                      </Link>
                    )}
                    <div className="my-1 border-t border-line" />
                    <Link
                      href="/artist/new"
                      onClick={() => setModeMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-cream"
                    >
                      + 아티스트 페이지 만들기
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {!isLoggedIn && (
            <>
              <Link href="/login" className="hidden hover:text-accent-strong sm:inline">
                로그인
              </Link>
              <Link href="/signup" className="hover:text-accent-strong">
                회원가입
              </Link>
            </>
          )}

          {isLoggedIn && (
            <button type="button" onClick={handleLogout} className="hover:text-accent-strong">
              로그아웃
            </button>
          )}

          {isLoggedIn && (
            <Link
              href="/wishlist"
              aria-label="위시리스트"
              className="flex items-center gap-1 hover:text-accent-strong"
            >
              <Heart aria-hidden className="size-4" />
              <span className="hidden lg:inline">위시리스트</span>
            </Link>
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

      <CategoryNav />
    </header>
  );
}
