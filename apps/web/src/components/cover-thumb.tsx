import Image from "next/image";

/**
 * Square cover that accepts both coverColor shapes in the data: Tailwind gradient classes from
 * the DB ("from-lime-300 to-emerald-700") and raw CSS gradients from the demo data.
 */
export function CoverThumb({
  imageUrl,
  coverColor,
  alt = "",
  sizes = "64px",
  className = "",
}: {
  imageUrl?: string;
  coverColor: string;
  alt?: string;
  sizes?: string;
  className?: string;
}) {
  const isCssGradient = coverColor.includes("gradient(");
  return (
    <div
      className={`relative aspect-square overflow-hidden bg-line ${isCssGradient ? "" : `bg-gradient-to-br ${coverColor}`} ${className}`}
      style={isCssGradient ? { backgroundImage: coverColor } : undefined}
    >
      {imageUrl && <Image src={imageUrl} alt={alt} fill sizes={sizes} className="object-cover" />}
    </div>
  );
}
