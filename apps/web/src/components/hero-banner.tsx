"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCatalog } from "@/lib/use-catalog";

const SLIDE_INTERVAL_MS = 5000;

const LABEL_TEXT: Record<string, string> = {
  BEST_OF_WEEK: "이번주 베스트",
  TRENDING: "요즘 뜨는",
};

interface HeroFeatureDto {
  id: string;
  label: string;
  imageUrl: string;
  name: string;
  subtitle: string | null;
}

interface HeroSettingsDto {
  headline: string;
  subtext: string | null;
  position: keyof typeof POSITION_STYLES;
}

const DEFAULT_HERO_SETTINGS: HeroSettingsDto = {
  headline: "아티스트가 자생하는 건강한 음악 생태계",
  subtext: "아직 소문나기 전, 그 아티스트의 다음 이야기를 가장 먼저 만나보세요.",
  position: "BOTTOM_LEFT",
};

/**
 * Wrapper position + text alignment + scrim gradient are kept in lockstep per corner
 * so the gradient's dark side always sits under whichever corner the copy is placed in.
 */
const POSITION_STYLES = {
  TOP_LEFT: {
    wrapper: "top-0 left-0",
    align: "items-start text-left",
    gradient: "linear-gradient(to bottom right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
  },
  TOP_CENTER: {
    wrapper: "top-0 left-1/2 -translate-x-1/2",
    align: "items-center text-center",
    gradient: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 65%)",
  },
  TOP_RIGHT: {
    wrapper: "top-0 right-0",
    align: "items-end text-right",
    gradient: "linear-gradient(to bottom left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
  },
  CENTER: {
    wrapper: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    align: "items-center text-center",
    gradient: "radial-gradient(circle at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)",
  },
  BOTTOM_LEFT: {
    wrapper: "bottom-0 left-0",
    align: "items-start text-left",
    gradient: "linear-gradient(to top right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
  },
  BOTTOM_CENTER: {
    wrapper: "bottom-0 left-1/2 -translate-x-1/2",
    align: "items-center text-center",
    gradient: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 65%)",
  },
  BOTTOM_RIGHT: {
    wrapper: "bottom-0 right-0",
    align: "items-end text-right",
    gradient: "linear-gradient(to top left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
  },
} as const;

export function HeroBanner() {
  const catalog = useCatalog();
  const [index, setIndex] = useState(0);
  const [heroFeatures, setHeroFeatures] = useState<HeroFeatureDto[] | null>(null);
  const [heroSettings, setHeroSettings] = useState<HeroSettingsDto>(DEFAULT_HERO_SETTINGS);

  useEffect(() => {
    fetch("/api/hero-features")
      .then((res) => res.json())
      .then(setHeroFeatures)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/hero-settings")
      .then((res) => res.json())
      .then((data: Partial<HeroSettingsDto>) =>
        setHeroSettings((prev) => ({ ...prev, ...data, position: data.position ?? prev.position }))
      )
      .catch(() => {});
  }, []);

  const featuredArtists = useMemo(() => {
    if (heroFeatures && heroFeatures.length > 0) {
      return heroFeatures.map((feature) => ({
        id: feature.id,
        name: feature.name,
        imageUrl: feature.imageUrl,
        label: feature.label,
        subtitle: feature.subtitle,
      }));
    }
    return (catalog?.artists ?? [])
      .filter((artist) => artist.imageUrl)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.imageUrl!,
        label: null,
        subtitle: null,
      }));
  }, [heroFeatures, catalog]);

  useEffect(() => {
    if (featuredArtists.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % featuredArtists.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [featuredArtists.length]);

  if (featuredArtists.length === 0) return null;

  const current = featuredArtists[index % featuredArtists.length];
  const positionStyle = POSITION_STYLES[heroSettings.position] ?? POSITION_STYLES.BOTTOM_LEFT;

  return (
    <section className="mb-16">
      <div className="hero-section relative min-h-[420px] overflow-hidden rounded-3xl border border-line shadow-[0_12px_40px_-16px_rgba(42,42,42,0.18)] sm:min-h-[480px]">
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

        {/* editorial scrim: dark on the copy's corner for contrast, fades out toward the rest of the artist photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: positionStyle.gradient }}
        />

        {current.label && (
          <div
            className={`absolute left-6 flex flex-col gap-1 sm:left-10 ${
              heroSettings.position.startsWith("TOP") ? "bottom-6 sm:bottom-8" : "top-6 sm:top-8"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                {LABEL_TEXT[current.label] ?? current.label}
              </span>
              <span className="rounded-full bg-black/30 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
                {current.name}
              </span>
            </div>
            {current.subtitle && (
              <p className="rounded-full bg-black/20 px-2.5 py-1 text-xs text-white/90 backdrop-blur-sm">
                {current.subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`absolute z-10 max-w-xl p-10 sm:p-12 ${positionStyle.wrapper}`}>
          <div className={`flex flex-col gap-1 ${positionStyle.align}`}>
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {heroSettings.headline}
            </h1>
            {heroSettings.subtext && (
              <p className="mt-3 text-sm text-white/85 sm:text-base">{heroSettings.subtext}</p>
            )}
            <Link
              href="#artists"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_-6px_rgba(139,117,215,0.55)] transition hover:bg-accent-strong hover:shadow-[0_8px_24px_-6px_rgba(139,117,215,0.65)]"
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
