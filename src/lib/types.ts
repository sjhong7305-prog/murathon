export type ProductType = "album" | "track" | "merch" | "ticket";

export type ArtistPostCategory =
  | "녹음 비하인드"
  | "공연 영상"
  | "악기 연주"
  | "가사 소개"
  | "작업실 일상";

export interface ArtistPost {
  id: string;
  category: ArtistPostCategory;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likeCount: number;
}

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
  supporters?: string[];
  feedPosts?: ArtistPost[];
}

export interface SecretContent {
  title: string;
  message: string;
}

export interface Product {
  id: string;
  artistId: string;
  type: ProductType;
  title: string;
  description: string;
  format?: string;
  minPrice: number;
  suggestedPrice: number;
  coverColor: string;
  imageUrl?: string;
  previewAudioUrl?: string;
  secretContent?: SecretContent;
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
