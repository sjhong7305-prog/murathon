// Kept dependency-free (no sharp/COS imports) so client components can import these limits
// directly, same convention as artist-image-limits.ts / artist-feed-constants.ts.
export const MAX_TRACK_COVER_BYTES = 8 * 1024 * 1024;
/** FLAC (lossless) runs much larger than mp3 for the same track, hence the generous cap. */
export const MAX_TRACK_AUDIO_BYTES = 100 * 1024 * 1024;
export const TRACK_AUDIO_ALLOWED_MIME = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
];
export const TRACK_AUDIO_ALLOWED_EXT = [".mp3", ".m4a", ".wav", ".ogg", ".flac"];
export const TRACK_AUDIO_ALLOWED_LABEL = "mp3, m4a, wav, ogg, flac";
