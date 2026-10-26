import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
              <main className="flex-1 pb-20">{children}</main>
              <footer className="border-t border-line py-8 text-center text-xs text-muted">
                MU:RATHON — 아티스트 직거래 플랫폼 프로토타입. 결제는 실제로 처리되지 않습니다.
              </footer>
              <MiniPlayer />
            </PlayerProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
