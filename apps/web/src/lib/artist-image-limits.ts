// Shared between the server-side sharp pipeline (artist-image-pipeline.ts) and client-side
// upload forms — kept in its own file (no sharp import) so client components can import it
// without pulling sharp into the browser bundle.
export const MAX_BANNER_BYTES = 10 * 1024 * 1024;
export const MAX_PROFILE_BYTES = 2 * 1024 * 1024;
export const MAX_BACKGROUND_BYTES = 5 * 1024 * 1024;
