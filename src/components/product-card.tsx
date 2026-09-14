import Link from "next/link";
import { Product } from "@/lib/types";
import { CoverArt } from "./cover-art";
import { HoverAudioPreview } from "./hover-audio-preview";
import { formatWon } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const isPwyw = product.minPrice === 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col gap-3 rounded-2xl p-3 transition hover:bg-surface"
    >
      {product.previewAudioUrl ? (
        <HoverAudioPreview
          gradient={product.coverColor}
          label={product.title}
          type={product.type}
          imageUrl={product.imageUrl}
          audioSrc={product.previewAudioUrl}
          hasSecret={Boolean(product.secretContent)}
        />
      ) : (
        <CoverArt
          gradient={product.coverColor}
          label={product.title}
          type={product.type}
          imageUrl={product.imageUrl}
          hasSecret={Boolean(product.secretContent)}
        />
      )}
      <div>
        <h3 className="font-bold text-ink group-hover:underline">{product.title}</h3>
        <p className="text-sm text-muted">{product.format}</p>
        <p className="mt-1 text-sm">
          {isPwyw ? (
            <>
              <span className="font-semibold text-ink">
                {formatWon(product.suggestedPrice)}
              </span>{" "}
              <span className="font-bold text-accent-strong">(자율 가격, 0원부터)</span>
            </>
          ) : (
            <span className="font-semibold text-accent-strong">
              {formatWon(product.suggestedPrice)}부터
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
