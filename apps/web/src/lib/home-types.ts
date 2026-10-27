/** Serializable view models for the home page's discovery sections (server → client props). */

/** Enough to hand a release to the player (`usePlayer().playOne`) and render its cover. */
export interface HomeTrack {
  productId: string;
  title: string;
  artistId: string;
  artistName: string;
  artistSlug: string;
  coverColor: string;
  imageUrl?: string;
  /** False when the release has no preview audio, so play buttons are hidden instead of failing. */
  playable: boolean;
}

/** One order item from the last 30 days. `supporter` is only set when the buyer opted in. */
export interface LiveSupport extends HomeTrack {
  id: string;
  amount: number;
  supporter: string | null;
  createdAt: string;
}

/** A public cheer message (order opted in as supporter), supporter note, or product comment. */
export interface FanVoice extends HomeTrack {
  id: string;
  message: string;
  supporter: string;
  /** Only present for order-backed messages — notes and comments have no paid amount attached. */
  amount?: number;
  createdAt: string;
}
