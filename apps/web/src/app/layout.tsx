import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
// Pretendard is the primary UI font (Korean first). The dynamic-subset build splits the font by
// unicode-range, so a page only downloads the glyph chunks it actually renders.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { PlayerProvider } from "@/context/player-context";
import { Header } from "@/components/header";
import { MiniPlayer } from "@/components/mini-player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MU:RATHON — 아티스트 직거래 플랫폼",
  description: "아티스트와 팬을 직접 연결하는 가격 후원(PWYW) 구매 플랫폼 프로토타입",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <AuthProvider>
          <CartProvider>
            <PlayerProvider>
              <Header />
              <main className="flex-1 pb-28">{children}</main>
              <footer className="border-t border-line">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black tracking-tight text-ink">MU:RATHON</p>
                    <p className="mt-1">아티스트 직거래 플랫폼 프로토타입. 결제는 실제로 처리되지 않습니다.</p>
                  </div>
                  <nav className="flex gap-4 font-medium">
                    <Link href="/artists" className="transition-colors hover:text-ink">아티스트</Link>
                    <Link href="/community" className="transition-colors hover:text-ink">커뮤니티</Link>
                    <Link href="/licenses" className="transition-colors hover:text-ink">폰트 라이선스</Link>
                  </nav>
                </div>
              </footer>
              <MiniPlayer />
            </PlayerProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
