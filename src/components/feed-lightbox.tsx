"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { FeedMediaView } from "@/lib/artist-feed";
import { FeedVideo } from "./feed-media-grid";

export function FeedLightbox({
  media,
  startIndex,
  onClose,
}: {
  media: FeedMediaView[];
  startIndex: number;
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, startIndex });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, scrollPrev, scrollNext]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X size={20} />
      </button>

      <div className="h-full w-full max-w-3xl overflow-hidden" ref={emblaRef} onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full">
          {media.map((m) => (
            <div key={m.id} className="flex h-full w-full shrink-0 grow-0 basis-full items-center justify-center">
              {m.url ? (
                m.type === "VIDEO" ? (
                  <FeedVideo url={m.url} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="relative h-full w-full">
                    <Image src={m.url} alt="" fill sizes="100vw" className="object-contain" />
                  </div>
                )
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollPrev();
            }}
            aria-label="이전"
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollNext();
            }}
            aria-label="다음"
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}
    </div>
  );
}
