"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import type { FeedMediaView } from "@/lib/artist-feed";
import { FeedLightbox } from "./feed-lightbox";

/** Muted-autoplay video that only plays while scrolled into view — tap toggles sound. */
export function FeedVideo({
  url,
  className,
  onClick,
}: {
  url: string;
  className?: string;
  onClick?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={url}
        className={className}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={(e) => {
          if (onClick) {
            onClick();
            return;
          }
          e.stopPropagation();
          setMuted((m) => !m);
        }}
      />
      {!onClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  );
}

/** `sizes` reflects the card's own responsive width (up to the 720px feed cap) so the browser can pick an appropriately-sized image, not one baked in for the old 600px cap. */
function MediaCell({ media, onOpen, sizes }: { media: FeedMediaView; onOpen: () => void; sizes: string }) {
  if (!media.url) return <div className="h-full w-full bg-cream" />;
  if (media.type === "VIDEO") {
    return <FeedVideo url={media.url} className="h-full w-full object-cover" onClick={onOpen} />;
  }
  return (
    <button type="button" onClick={onOpen} className="relative block h-full w-full">
      <Image src={media.url} alt="" fill sizes={sizes} className="object-cover" loading="lazy" />
    </button>
  );
}

const FULL_WIDTH_SIZES = "(max-width: 640px) 100vw, 720px";
const HALF_WIDTH_SIZES = "(max-width: 640px) 50vw, 360px";

/**
 * Weverse-style multi-image layout: 1 = original aspect ratio (height-capped), 2-4 = a mosaic
 * grid filling one screen, 5+ = a 4-cell grid with a "+N" overlay on the last cell. Any cell opens
 * the shared fullscreen lightbox at that index.
 */
export function FeedMediaGrid({ media }: { media: FeedMediaView[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  if (media.length === 0) return null;

  const open = (i: number) => setLightboxIndex(i);

  if (media.length === 1) {
    const m = media[0];
    const ratio = m.width && m.height ? m.width / m.height : 1;
    return (
      <>
        <div className="w-full overflow-hidden bg-cream" style={{ aspectRatio: ratio, maxHeight: 600 }}>
          <MediaCell media={m} onOpen={() => open(0)} sizes={FULL_WIDTH_SIZES} />
        </div>
        {lightboxIndex !== null && <FeedLightbox media={media} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
      </>
    );
  }

  if (media.length === 2) {
    return (
      <>
        <div className="grid aspect-[2/1.1] w-full grid-cols-2 gap-0.5 bg-cream">
          {media.map((m, i) => (
            <MediaCell key={m.id} media={m} onOpen={() => open(i)} sizes={HALF_WIDTH_SIZES} />
          ))}
        </div>
        {lightboxIndex !== null && <FeedLightbox media={media} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
      </>
    );
  }

  if (media.length === 3) {
    return (
      <>
        <div className="grid aspect-square w-full grid-cols-2 grid-rows-2 gap-0.5 bg-cream">
          <div className="row-span-2">
            <MediaCell media={media[0]} onOpen={() => open(0)} sizes={HALF_WIDTH_SIZES} />
          </div>
          <MediaCell media={media[1]} onOpen={() => open(1)} sizes={HALF_WIDTH_SIZES} />
          <MediaCell media={media[2]} onOpen={() => open(2)} sizes={HALF_WIDTH_SIZES} />
        </div>
        {lightboxIndex !== null && <FeedLightbox media={media} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
      </>
    );
  }

  // 4 or more — 2x2 grid; 5+ overlays "+N" on the 4th cell.
  const extra = media.length - 4;
  return (
    <>
      <div className="grid aspect-square w-full grid-cols-2 grid-rows-2 gap-0.5 bg-cream">
        {media.slice(0, 4).map((m, i) => (
          <div key={m.id} className="relative">
            <MediaCell media={m} onOpen={() => open(i)} sizes={HALF_WIDTH_SIZES} />
            {i === 3 && extra > 0 && (
              <button
                type="button"
                onClick={() => open(3)}
                className="absolute inset-0 flex items-center justify-center bg-black/55 text-xl font-bold text-white"
              >
                +{extra}
              </button>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && <FeedLightbox media={media} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
    </>
  );
}
