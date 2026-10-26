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
  headline: "아직 소문나기 전, 좋아하는 음악을 발견하고",
  subtext: "그 아티스트의 다음 이야기를 가장 먼저 만나보세요.",
  position: "BOTTOM_LEFT",
};

const DEMO_FEATURES = [
  {
    id: "demo-feature",
    name: "Balming Tiger",
    imageUrl:
      "https://images.unsplash.com/photo-1714589334427-fb015b709c51?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=90&w=1600",
    label: "TRENDING",
    subtitle: "Alternative K-pop collective · Seoul",
  },
];

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

export function HeroBanner({ demo = false }: { demo?: boolean }) {
  const catalog = useCatalog(!demo);
  const [index, setIndex] = useState(0);
  const [heroFeatures, setHeroFeatures] = useState<HeroFeatureDto[] | null>(null);
  const [heroSettings, setHeroSettings] = useState<HeroSettingsDto>(DEFAULT_HERO_SETTINGS);

  useEffect(() => {
    if (demo) return;
    fetch("/api/hero-features")
      .then((res) => res.json())
      .then(setHeroFeatures)
      .catch(() => {});
  }, [demo]);

  useEffect(() => {
    if (demo) return;
    fetch("/api/hero-settings")
      .then((res) => res.json())
      .then((data: Partial<HeroSettingsDto>) =>
        setHeroSettings((prev) => ({ ...prev, ...data, position: data.position ?? prev.position }))
      )
      .catch(() => {});
  }, [demo]);

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
    const catalogArtists = (catalog?.artists ?? [])
      .filter((artist) => artist.imageUrl)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.imageUrl!,
        label: null,
        subtitle: null,
      }));
    return catalogArtists.length > 0 ? catalogArtists : DEMO_FEATURES;
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
    <section className="mb-7">
      <div className="relative min-h-[500px] overflow-hidden rounded-3xl bg-ink sm:min-h-[540px]">
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
              className="object-cover grayscale-[20%]"
            />
          </motion.div>
        </AnimatePresence>

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
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">
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

        <div className={`absolute z-10 max-w-xl p-6 sm:p-10 ${positionStyle.wrapper}`}>
          <div className={`flex flex-col gap-1 ${positionStyle.align}`}>
            <h1 className="max-w-md text-xl font-black leading-snug tracking-tight text-white sm:text-[1.6rem]">
              {heroSettings.headline}
            </h1>
            {heroSettings.subtext && (
              <p className="mt-1 text-sm font-bold text-accent sm:text-base">{heroSettings.subtext}</p>
            )}
            <Link
              href="#artists"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-black text-ink transition hover:bg-surface"
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
