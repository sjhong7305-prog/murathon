"use client";

import { useEffect, useMemo, useState } from "react";
import type { Artist, Product } from "./types";

interface RawCatalog {
  artists: Artist[];
  products: Product[];
}

export interface Catalog extends RawCatalog {
  getArtistById: (id: string) => Artist | undefined;
  getProductById: (id: string) => Product | undefined;
}

/** Client-side replacement for the old synchronous data.ts reads — fetches the DB-backed catalog once on mount. */
export function useCatalog(): Catalog | null {
  const [raw, setRaw] = useState<RawCatalog | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then(setRaw)
      .catch(() => {});
  }, []);

  return useMemo(() => {
    if (!raw) return null;
    const artistMap = new Map(raw.artists.map((a) => [a.id, a]));
    const productMap = new Map(raw.products.map((p) => [p.id, p]));
    return {
      artists: raw.artists,
      products: raw.products,
      getArtistById: (id: string) => artistMap.get(id),
      getProductById: (id: string) => productMap.get(id),
    };
  }, [raw]);
}
