export type ProductType = "album" | "track" | "merch" | "ticket";
export type ProductStatus = "published" | "unpublished";

/** A release's musical shape. Only meaningful for album/track products. */
export type ReleaseType = "single" | "ep" | "album";

/** A sellable format of a release. Only "digital" is ever created by the UI today. */
export type ReleaseFormatType = "digital" | "cd" | "vinyl" | "cassette";

export interface ReleaseFormat {
  id: string;
  format: ReleaseFormatType;
  price: number;
  stock?: number;
  includesDigital: boolean;
  shippingRequired: boolean;
}

import type { ArtistTheme } from "./artist-theme";

export interface ArtistExternalLinks {
  sns?: string;
  youtube?: string;
  website?: string;
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  genre: string;
  genreTags?: string[];
  location: string;
  tagline: string;
  introduction: string;
  coverColor: string;
  imageUrl?: string;
  bannerImage?: string;
  externalLinks?: ArtistExternalLinks;
  checkoutQuestion?: string;
  subscriptionPriceMonthly?: number;
  subscriptionPriceYearly?: number;
  subscriptionBenefits?: string[];
  membershipEnabled?: boolean;
  supporters?: string[];
  payoutStatus?: "NONE" | "PENDING" | "VERIFIED";
  theme?: ArtistTheme | null;
}

export interface SecretContent {
  title: string;
  message: string;
}

export interface ArtistMemberSummary {
  id: string;
  name: string;
  imageUrl?: string;
  roleLabel?: string;
}

export interface AlbumTrack {
  id: string;
  trackNumber: number;
  title: string;
  durationSec: number;
  isTitle: boolean;
}

export interface Product {
  id: string;
  artistId: string;
  type: ProductType;
  status: ProductStatus;
  title: string;
  description: string;
  format?: string;
  /** album/track only. See ReleaseType. */
  releaseType?: ReleaseType;
  /** album/track only — the release's sellable formats (today: exactly one "digital" row). */
  formats?: ReleaseFormat[];
  genre?: string;
  minPrice: number;
  suggestedPrice: number;
  coverColor: string;
  imageUrl?: string;
  previewAudioUrl?: string;
  secretContent?: SecretContent;
  eventName?: string;
  venue?: string;
  eventAt?: string;
  includedAlbumId?: string;
  longDescription?: string;
  releaseDate?: string;
  credits?: string;
  durationSec?: number;
  tracks?: AlbumTrack[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  artistName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  cheerMessage: string;
  promptQuestion?: string;
  promptAnswer?: string;
  listAsSupporter: boolean;
  primaryArtistId?: string;
  items: OrderItem[];
  total: number;
}
