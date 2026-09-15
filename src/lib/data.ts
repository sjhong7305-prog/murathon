import { Artist, Product } from "./types";

export const artists: Artist[] = [];

export const products: Product[] = [];

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function getArtistById(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}

export function getProductsByArtist(artistId: string): Product[] {
  return products.filter((p) => p.artistId === artistId);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
