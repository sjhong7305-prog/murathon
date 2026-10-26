"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCatalog } from "@/lib/use-catalog";
import { artistFontClassName } from "@/lib/artist-fonts";

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
 * Where the copy card sits on the photo, per the backoffice "text position" setting.
 * On phones the card stacks below the photo instead, so it never covers the subject;
 * the configured corner applies from `sm` up.
 */
const POSITION_STYLES = {
  TOP_LEFT: "sm:top-6 sm:left-6 sm:bottom-auto sm:right-auto",
  TOP_CENTER: "sm:top-6 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:right-auto",
  TOP_RIGHT: "sm:top-6 sm:right-6 sm:bottom-auto sm:left-auto",
  CENTER: "sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:right-auto",
  BOTTOM_LEFT: "sm:bottom-6 sm:left-6 sm:right-auto",
  BOTTOM_CENTER: "sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto",
  BOTTOM_RIGHT: "sm:bottom-6 sm:right-6 sm:left-auto",
} as const;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hero-lime)";

export function HeroBanner() {
  const catalog = useCatalog();
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [heroFeatures, setHeroFeatures] = useState<HeroFeatureDto[] | null>(null);
  const [heroSettings, setHeroSettings] = useState<HeroSettingsDto>(DEFAULT_HERO_SETTINGS);
  // Image URLs that failed to load (e.g. an upload missing from this app's disk) fall back to the poster.
  const [brokenImageUrls, setBrokenImageUrls] = useState<ReadonlySet<string>>(new Set());

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

  const slideCount = featuredArtists.length;
  // Auto-advance stops for reduced-motion users and whenever the viewer pauses it (WCAG 2.2.2).
  const isAutoPlaying = slideCount > 1 && !isPaused && !prefersReducedMotion;

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slideCount);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slideCount]);

  const current = slideCount > 0 ? featuredArtists[index % slideCount] : null;
  const positionClass = POSITION_STYLES[heroSettings.position] ?? POSITION_STYLES.BOTTOM_LEFT;
  const isCopyOnTop = heroSettings.position.startsWith("TOP");
  const goTo = (next: number) => setIndex((next + slideCount) % slideCount);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="MU:RATHON 추천 아티스트"
      className={`hero-murathon mb-16 ${artistFontClassName("pretendard")}`}
    >
      <div className="border-2 border-(--hero-ink) bg-(--hero-ink)">
        {/* Masthead strip: brand mark on the left, slide controls on the right. */}
        <div className="flex h-11 items-center justify-between gap-3 px-4 text-(--hero-paper)">
          <p className="flex items-center gap-2 whitespace-nowrap text-xs font-bold tracking-[0.12em] sm:tracking-[0.2em]">
            <span aria-hidden className="inline-block size-2.5 bg-(--hero-lime)" />
            MU:RATHON PICK
          </p>
          {slideCount > 1 && (
            <div className="flex items-center gap-1">
              <span className="mr-1 whitespace-nowrap font-mono text-xs tabular-nums sm:mr-2" aria-live={isAutoPlaying ? "off" : "polite"}>
                {String((index % slideCount) + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="이전 아티스트"
                className={`grid size-8 place-items-center text-(--hero-paper) transition hover:bg-(--hero-paper)/15 ${FOCUS_RING}`}
              >
                <ChevronLeft aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="다음 아티스트"
                className={`grid size-8 place-items-center text-(--hero-paper) transition hover:bg-(--hero-paper)/15 ${FOCUS_RING}`}
              >
                <ChevronRight aria-hidden className="size-4" />
              </button>
              {!prefersReducedMotion && (
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  aria-label={isPaused ? "자동 넘김 재생" : "자동 넘김 일시정지"}
                  aria-pressed={isPaused}
                  className={`grid size-8 place-items-center text-(--hero-paper) transition hover:bg-(--hero-paper)/15 ${FOCUS_RING}`}
                >
                  {isPaused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative bg-(--hero-paper) sm:min-h-[500px] lg:min-h-[540px]">
          <div className="relative h-[clamp(260px,85vw,380px)] overflow-hidden sm:absolute sm:inset-0 sm:h-auto">
            {current && !brokenImageUrls.has(current.imageUrl) ? (
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${(index % slideCount) + 1} / ${slideCount}: ${current.name}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.imageUrl}
                    alt={current.name}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1280px) 100vw, 1248px"
                    className="object-cover"
                    onError={() => setBrokenImageUrls((prev) => new Set(prev).add(current.imageUrl))}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              // No usable artist photo: a typographic poster so the headline and CTA still lead the page.
              <div aria-hidden className="absolute inset-0">
                <div className="absolute right-0 top-0 h-full w-1/2 border-l-2 border-(--hero-ink) bg-(--hero-lime) max-sm:w-full max-sm:border-l-0" />
                <p className="absolute right-6 top-6 text-right text-5xl font-bold leading-none tracking-tight text-(--hero-ink) sm:text-7xl lg:text-8xl">
                  MU:
                  <br />
                  RATHON
                </p>
                <div className="absolute right-6 top-6 hidden size-16 translate-y-40 rounded-full border-2 border-(--hero-ink) bg-(--hero-orange) sm:block lg:translate-y-52" />
              </div>
            )}

            {current?.label && (
              <div
                className={`absolute left-4 top-4 z-10 flex flex-col items-start gap-1.5 sm:left-6 ${
                  isCopyOnTop ? "sm:top-auto sm:bottom-6" : "sm:top-6"
                }`}
              >
                <div className="flex items-stretch border-2 border-(--hero-ink)">
                  <span className="bg-(--hero-lime) px-3 py-1 text-xs font-bold text-(--hero-ink)">
                    {LABEL_TEXT[current.label] ?? current.label}
                  </span>
                  <span className="border-l-2 border-(--hero-ink) bg-(--hero-paper) px-3 py-1 text-sm font-bold text-(--hero-ink)">
                    {current.name}
                  </span>
                </div>
                {current.subtitle && (
                  <p className="border-2 border-(--hero-ink) bg-(--hero-ink) px-2.5 py-1 text-xs font-medium text-(--hero-paper)">
                    {current.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            className={`relative z-10 border-t-2 border-(--hero-ink) bg-(--hero-paper) p-6 sm:absolute sm:w-[min(30rem,calc(100%-3rem))] sm:border-2 sm:p-8 ${positionClass}`}
          >
            <h1 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-(--hero-ink) [word-break:keep-all] sm:text-4xl lg:text-[2.75rem]">
              {heroSettings.headline}
            </h1>
            {heroSettings.subtext && (
              <p className="mt-3 text-sm leading-relaxed text-(--hero-ink)/75 [word-break:keep-all] sm:text-base">
                {heroSettings.subtext}
              </p>
            )}
            <Link
              href="#artists"
              className="mt-6 inline-flex items-center gap-2 border-2 border-(--hero-ink) bg-(--hero-orange) px-6 py-3 text-sm font-bold text-(--hero-ink) transition hover:bg-(--hero-lime) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hero-ink)"
            >
              아티스트 둘러보기
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
