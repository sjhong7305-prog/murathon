import Image from "next/image";

const TYPE_LABEL: Record<string, string> = {
  album: "ALBUM",
  track: "TRACK",
  merch: "MERCH",
  ticket: "TICKET",
};

export function CoverArt({
  gradient,
  label,
  type,
  imageUrl,
  className = "",
  sizes = "(max-width: 640px) 50vw, 320px",
  priority = false,
  rounded = "rounded-xl",
  hideLabel = false,
  hasSecret = false,
  initial,
}: {
  gradient: string;
  label: string;
  type?: string;
  imageUrl?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
  hideLabel?: boolean;
  hasSecret?: boolean;
  /** Shown centered over the gradient when there's no imageUrl — e.g. an artist's initial. */
  initial?: string;
}) {
  return (
    <div
      className={`relative flex aspect-square w-full items-end overflow-hidden ${rounded} bg-gradient-to-br ${gradient} ${className}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={label}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        initial && (
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white/85">
            {initial}
          </span>
        )
      )}
      {!hideLabel && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      )}
      {!hideLabel && type && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-black/30 px-2 py-1 text-[10px] font-semibold tracking-wider text-white backdrop-blur-sm">
          {TYPE_LABEL[type] ?? type.toUpperCase()}
        </span>
      )}
      {!hideLabel && hasSecret && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-amber-400/90 px-2 py-1 text-[10px] font-bold tracking-wide text-black shadow">
          🔒 시크릿
        </span>
      )}
      {!hideLabel && (
        <span className="relative z-10 w-full p-3 text-sm font-bold leading-tight text-white drop-shadow-sm">
          {label}
        </span>
      )}
    </div>
  );
}
