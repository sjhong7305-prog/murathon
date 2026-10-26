"use client";

import { useState } from "react";
import type { Artist, Product } from "@muraton/shared/types";
import type { FeedPage } from "@/lib/artist-feed";
import { ArtistTheme } from "@muraton/shared/artist-theme";
import { computeArtistThemeStyle } from "@/lib/artist-theme-vars";
import { ArtistBanner } from "./artist-banner";
import { ARTIST_TABS } from "./artist-tab-bar";
import { ProductCard } from "./product-card";
import { FeedCard } from "./feed-card";
import { SubscriptionCard } from "./subscription-card";

/**
 * "What will the real page look like" preview for the appearance editor. The real public route
 * (src/app/artists/[slug]/layout.tsx + per-tab page.tsx files) does actual URL-routed tabs; this
 * component simulates the same banner/tabs/sidebar composition with client-side tab state instead,
 * since it lives inside a small embedded preview panel, not real navigation. Community/events tabs
 * show a placeholder here (their data isn't threaded into the editor) — full content is always
 * "실제 페이지로 보기"-away.
 */
export function ThemedArtistView({
  artist,
  theme,
  products,
  initialFeed,
  followerCount = 0,
}: {
  artist: Artist;
  theme: ArtistTheme;
  products: Product[];
  initialFeed: FeedPage;
  followerCount?: number;
}) {
  const [tab, setTab] = useState<(typeof ARTIST_TABS)[number]["key"]>("home");
  const { vars, backgroundStyle, fontClassName, readableCardText } = computeArtistThemeStyle(theme);

  const latestRelease = products.find((p) => p.type === "album" || p.type === "track");

  return (
    <div style={{ ...vars, ...backgroundStyle }} className={`w-full ${fontClassName}`}>
      <ArtistBanner artist={artist} theme={theme} followerCount={followerCount} preview />

      <nav
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: "var(--artist-card)", borderColor: "color-mix(in srgb, var(--artist-text) 12%, transparent)" }}
      >
        <div className="scrollbar-hide flex gap-1 overflow-x-auto overscroll-x-contain px-3">
          {ARTIST_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="shrink-0 border-b-2 px-3 py-2.5 text-sm font-bold transition"
              style={{
                borderColor: tab === t.key ? "var(--artist-accent)" : "transparent",
                color: tab === t.key ? "var(--artist-text)" : "var(--artist-card-text)",
                opacity: tab === t.key ? 1 : 0.65,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="px-4 py-6" style={{ color: "var(--artist-text)" }}>
        {tab === "home" && (
          <div className="flex flex-col gap-8">
            {latestRelease && (
              <section>
                <h2 className="mb-3 text-base font-bold" style={{ color: "var(--artist-text)" }}>
                  최신 발매작
                </h2>
                <div className="max-w-[220px]">
                  <ProductCard product={latestRelease} theme={{ card: theme.colors.card, text: readableCardText, accent: theme.colors.accent }} />
                </div>
              </section>
            )}
            {initialFeed.posts.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-bold" style={{ color: "var(--artist-text)" }}>
                  최근 피드
                </h2>
                <div className="flex flex-col gap-4">
                  {initialFeed.posts.slice(0, 3).map((p) => (
                    <FeedCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}
            {artist.membershipEnabled && (
              <SubscriptionCard
                artistId={artist.id}
                artistName={artist.name}
                monthlyPrice={artist.subscriptionPriceMonthly}
                yearlyPrice={artist.subscriptionPriceYearly}
                benefits={artist.subscriptionBenefits}
              />
            )}
          </div>
        )}

        {tab === "discography" && (
          <div
            className={
              theme.discographyLayout === "list" ? "flex flex-col gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-3"
            }
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout={theme.discographyLayout}
                theme={{ card: theme.colors.card, text: readableCardText, accent: theme.colors.accent }}
              />
            ))}
          </div>
        )}

        {tab === "feed" && (
          <div className="flex flex-col gap-4">
            {initialFeed.posts.length === 0 ? (
              <p className="py-10 text-center text-sm opacity-70">아직 피드가 없어요.</p>
            ) : (
              initialFeed.posts.map((p) => <FeedCard key={p.id} post={p} />)
            )}
          </div>
        )}

        {(tab === "community" || tab === "events") && (
          <p className="py-10 text-center text-sm opacity-70">
            미리보기에서는 지원하지 않아요 — &quot;실제 페이지로 보기&quot;에서 확인하세요.
          </p>
        )}
      </div>
    </div>
  );
}
