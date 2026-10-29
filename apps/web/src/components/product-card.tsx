import Link from "next/link";
import { Product } from "@muraton/shared/types";
import { CoverArt } from "./cover-art";
import { HoverAudioPreview } from "./hover-audio-preview";
import { formatWon } from "@muraton/shared/format";
import { formatReleaseLabel } from "@muraton/shared/release-label";

interface ProductCardThemeColors {
  card: string;
  text: string;
  accent: string;
}

export function ProductCard({
  product,
  layout = "grid",
  theme,
}: {
  product: Product;
  layout?: "grid" | "list";
  theme?: ProductCardThemeColors;
}) {
  const isPwyw = product.minPrice === 0;
  const isList = layout === "list";

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group flex gap-3 rounded-2xl p-3 transition ${isList ? "flex-row items-center" : "flex-col"} ${theme ? "" : "hover:bg-surface"}`}
      style={theme ? { backgroundColor: theme.card, color: theme.text } : undefined}
    >
      <div className={isList ? "w-16 shrink-0 sm:w-20" : "w-full"}>
        {product.previewAudioUrl ? (
          <HoverAudioPreview
            productId={product.id}
            gradient={product.coverColor}
            label={product.title}
            type={product.type}
            imageUrl={product.imageUrl}
            hasSecret={Boolean(product.secretContent)}
            hideLabel={isList}
          />
        ) : (
          <CoverArt
            gradient={product.coverColor}
            label={product.title}
            type={product.type}
            imageUrl={product.imageUrl}
            hasSecret={Boolean(product.secretContent)}
            hideLabel={isList}
          />
        )}
      </div>
      <div className="min-w-0">
        <h3 className={`truncate font-bold group-hover:underline ${theme ? "" : "text-ink"}`}>
          {product.title}
        </h3>
        <p className={`text-sm ${theme ? "opacity-70" : "text-muted"}`}>{formatReleaseLabel(product)}</p>
        <p className="mt-1 text-sm">
          {isPwyw ? (
            <>
              <span className={`font-semibold ${theme ? "" : "text-ink"}`}>
                {formatWon(product.suggestedPrice)}
              </span>{" "}
              <span
                className={`font-bold ${theme ? "" : "text-accent-strong"}`}
                style={theme ? { color: theme.accent } : undefined}
              >
                (자율 가격, 0원부터)
              </span>
            </>
          ) : (
            <span
              className={`font-semibold ${theme ? "" : "text-accent-strong"}`}
              style={theme ? { color: theme.accent } : undefined}
            >
              {formatWon(product.suggestedPrice)}부터
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
