"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@muraton/shared/types";
import { ProductCard } from "./product-card";

// Constant scroll speed, so a longer list takes proportionally longer to loop.
const SPEED_PX_PER_SEC = 40;

export function ReleaseMarquee({ products }: { products: Product[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(2);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const set = setRef.current;
    if (!viewport || !set) return;

    const measure = () => {
      const setWidth = set.offsetWidth;
      if (!setWidth) return;
      // The track shifts by exactly one set per cycle, so the remaining copies
      // must still cover the viewport at the end of the cycle — otherwise a gap
      // opens on the right when there are only a few cards.
      setCopies(Math.max(2, Math.ceil(viewport.offsetWidth / setWidth) + 1));
      setDuration(setWidth / SPEED_PX_PER_SEC);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(set);
    return () => observer.disconnect();
  }, [products]);

  if (products.length === 0) return null;

  return (
    <div ref={viewportRef} className="marquee" aria-label="지금 인기 있는 발매작" role="region">
      <div
        className="marquee-track"
        data-ready={duration > 0 ? "" : undefined}
        style={
          {
            "--marquee-copies": copies,
            "--marquee-duration": `${duration}s`,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: copies }, (_, copy) => (
          <ul
            key={copy}
            ref={copy === 0 ? setRef : undefined}
            // Clones are purely visual: hide them from screen readers and tab order.
            aria-hidden={copy > 0 || undefined}
            inert={copy > 0}
            // pr-2 equals gap-2, so the seam between copies matches every other gap.
            className={`marquee-set flex shrink-0 gap-2 pr-2 ${copy > 0 ? "marquee-clone" : ""}`}
          >
            {products.map((product) => (
              <li key={product.id} className="marquee-item shrink-0">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
