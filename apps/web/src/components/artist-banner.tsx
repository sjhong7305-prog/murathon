import Image from "next/image";
import type { Artist } from "@muraton/shared/types";
import type { ArtistTheme } from "@muraton/shared/artist-theme";
import { FollowArtistButton } from "./follow-artist-button";

/**
 * Full-bleed banner (fixed height, object-fit:cover — deliberately not aspect-ratio-locked so it
 * always fills the viewport width regardless of the uploaded image's shape). No bannerImage falls
 * back to a gradient built from the artist's own theme accent color, not the old coverColor preset.
 */
export function ArtistBanner({
  artist,
  theme,
  followerCount,
  preview = false,
}: {
  artist: Artist;
  theme: ArtistTheme;
  followerCount: number;
  preview?: boolean;
}) {
  const accent = theme.colors.accent;

  return (
    <div className="relative h-[200px] w-full overflow-hidden sm:h-[240px] lg:h-[320px] xl:h-[400px]">
      {artist.bannerImage ? (
        preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.bannerImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <Image src={artist.bannerImage} alt="" fill priority sizes="100vw" className="object-cover" />
        )
      ) : (
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, black) 100%)`,
          }}
        />
      )}

      {/* Fixed dark-from-bottom gradient for text legibility — independent of the artist's theme, since it always sits over a photo/gradient rather than the themed page background. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3 px-4 pb-4 sm:pb-6">
          <div className="flex min-w-0 items-end gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/80 shadow-md sm:h-16 sm:w-16">
              {artist.imageUrl ? (
                preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" />
                ) : (
                  <Image src={artist.imageUrl} alt={artist.name} width={64} height={64} className="h-full w-full object-cover" />
                )
              ) : (
                <div className="h-full w-full" style={{ backgroundColor: accent }} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/80 sm:text-sm">
                {artist.genre} · {artist.location}
              </p>
              <h1 className="mt-0.5 truncate text-2xl font-bold text-white drop-shadow sm:text-3xl lg:text-4xl">
                {artist.name}
              </h1>
              <p className="mt-0.5 text-xs text-white/70 sm:text-sm">팔로워 {followerCount.toLocaleString("ko-KR")}명</p>
            </div>
          </div>
          <FollowArtistButton artistId={artist.id} />
        </div>
      </div>
    </div>
  );
}
