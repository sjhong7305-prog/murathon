import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@muraton/db";
import { serializeTrack } from "@/lib/track-serialize";
import { GENRES } from "@/lib/genres";
import { TrackPlayButton } from "@/components/track-play-button";
import { ArtistStorySection } from "@/components/artist-story-section";
import type { StoryPrompts } from "@/lib/tracks-storage";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trackRow = await prisma.track.findUnique({
    where: { id },
    include: {
      artist: { select: { name: true, slug: true, imageUrl: true, introduction: true } },
    },
  });
  if (!trackRow) notFound();

  const track = serializeTrack(trackRow);
  const genreLabel = GENRES.find((g) => g.slug === track.genre)?.label ?? track.genre;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/artists/${trackRow.artist.slug}`}
        className="text-sm font-semibold text-accent-strong hover:underline"
      >
        {trackRow.artist.name}
      </Link>
      <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{track.title}</h1>
      <p className="mt-1 text-sm text-muted">{genreLabel}</p>

      <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink">{track.description}</p>

      {track.previewAudioUrl && (
        <div className="mt-6">
          <TrackPlayButton
            trackId={track.id}
            title={track.title}
            artistName={trackRow.artist.name}
            artistSlug={trackRow.artist.slug}
            imageUrl={trackRow.artist.imageUrl ?? undefined}
            limitSeconds={track.previewLimitSeconds}
          />
        </div>
      )}

      <ArtistStorySection storyPrompts={track.storyPrompts as StoryPrompts | undefined} />

      <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-black text-ink">아티스트 소개</h2>
        <div className="mt-4 flex items-center gap-4">
          {trackRow.artist.imageUrl && (
            <Image
              src={trackRow.artist.imageUrl}
              alt={trackRow.artist.name}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-bold text-ink">{trackRow.artist.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {trackRow.artist.introduction}
            </p>
          </div>
        </div>
        <Link
          href={`/artists/${trackRow.artist.slug}`}
          className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          아티스트 페이지로 이동
        </Link>
      </section>
    </div>
  );
}
