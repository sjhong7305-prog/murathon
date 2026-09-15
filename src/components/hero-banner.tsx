"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { artists } from "@/lib/data";

const featuredArtists = artists
  .filter((artist) => artist.imageUrl)
  .map((artist) => ({ id: artist.id, name: artist.name, imageUrl: artist.imageUrl! }));

const SLIDE_INTERVAL_MS = 5000;

export function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (featuredArtists.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % featuredArtists.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const current = featuredArtists[index];

  return (
    <section className="mb-16">
      <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_12px_40px_-16px_rgba(42,42,42,0.18)] sm:min-h-[480px]">
        {current && (
          <AnimatePresence>
            <motion.div
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image
                src={current.imageUrl}
                alt={current.name}
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 100vw, 1200px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* cream scrim keeps ink-colored text readable over any featured photo */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-cream/75" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-transparent"
        />

        <div className="absolute inset-0 flex items-center justify-center px-8 py-14 sm:px-14 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-strong">
              MU:RATHON
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
              아티스트가 자생하는 건강한 음악 생태계
            </h1>
            <p className="mt-4 text-muted">
              아직 소문나기 전, 그 아티스트의 다음 이야기를 가장 먼저 만나보세요.
            </p>
            <Link
              href="#artists"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_-6px_rgba(139,117,215,0.55)] transition hover:bg-accent-strong hover:shadow-[0_8px_24px_-6px_rgba(139,117,215,0.65)]"
            >
              아티스트 둘러보기
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
