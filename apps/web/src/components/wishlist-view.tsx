"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import type { Product } from "@muraton/shared/types";
import { ReleaseGrid, type MusicArtist } from "@/components/music-browser";
import { knownLike, primeLikes, useLikesVersion } from "@/lib/use-product-like";

export function WishlistView({ releases, artists }: { releases: Product[]; artists: MusicArtist[] }) {
  // Everything here is liked by definition, so hearts start filled without asking the API per card.
  useState(() => primeLikes(releases.map((r) => r.id)));
  useLikesVersion();
  // Un-hearting a release (from its panel or the bottom player) takes it off the page right away.
  const visible = releases.filter((r) => knownLike(r.id) !== false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">위시리스트</h1>
          <p className="mt-2 text-sm text-muted tabular-nums">
            {visible.length > 0 ? `담아둔 음원 ${visible.length}개` : "하트를 누른 음원이 여기에 모여요."}
          </p>
        </div>
        {visible.length > 0 && (
          <Link
            href="/search?type=music"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-ink underline-offset-4 hover:underline"
          >
            음원 더 둘러보기
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        )}
      </div>

      {visible.length > 0 ? (
        <ReleaseGrid releases={visible} artists={artists} />
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-orange/10 text-orange">
            <Heart aria-hidden className="size-6" />
          </span>
          <p className="mt-5 text-lg font-bold text-ink">아직 담아둔 음원이 없어요</p>
          <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted">
            음원 카드를 열고 하트를 누르면 나중에 다시 듣고 싶은 음원을 여기에 모아둘 수 있어요.
          </p>
          <Link
            href="/search?type=music"
            className="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            음원 둘러보기
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
