import Image from "next/image";
import { Disc3, Lock } from "lucide-react";

/**
 * Square cover. With an image it is just the image: the title, type and price always sit next to
 * or below it, so nothing is printed on top. Without one it is a flat tone with a quiet disc mark
 * instead of a gradient placeholder.
 */
export function CoverArt({
  label,
  imageUrl,
  className = "",
  sizes = "(max-width: 640px) 50vw, 320px",
  priority = false,
  rounded = "rounded-xl",
  hideLabel = false,
  hasSecret = false,
  initial,
}: {
  /** Legacy gradient classes from the data; no longer painted (flat covers only). */
  gradient: string;
  label: string;
  /** Kept for callers; the release type is shown in the text beside the cover, not on it. */
  type?: string;
  imageUrl?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
  hideLabel?: boolean;
  hasSecret?: boolean;
  /** Shown centered when there's no imageUrl — e.g. an artist's initial. */
  initial?: string;
}) {
  return (
    <div
      className={`relative flex aspect-square w-full overflow-hidden bg-tone ${rounded} ${className}`}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={label} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : initial ? (
        <span className="absolute inset-0 flex items-center justify-center text-[2.5em] font-bold text-ink/35">
          {initial}
        </span>
      ) : (
        <Disc3 aria-hidden strokeWidth={1.25} className="m-auto size-[34%] text-ink/20" />
      )}
      {!hideLabel && hasSecret && (
        <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-1 text-[11px] font-bold text-cream">
          <Lock aria-hidden className="size-3" />
          시크릿
        </span>
      )}
    </div>
  );
}
