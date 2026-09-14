import { notFound } from "next/navigation";
import Image from "next/image";
import { AtSign, PlayCircle, Globe } from "lucide-react";
import { artists, getArtistBySlug, getProductsByArtist } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { SupportersSection } from "@/components/supporters-section";
import { ArtistIntroduction } from "@/components/artist-introduction";
import { ArtistFeed } from "@/components/artist-feed";

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) notFound();

  const artistProducts = getProductsByArtist(artist.id);
  const links = artist.externalLinks;
  const hasLinks = links && (links.sns || links.youtube || links.website);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="relative">
        <div
          className={`h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br sm:h-56 ${artist.coverColor}`}
        >
          {artist.bannerImage && (
            <Image
              src={artist.bannerImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="absolute -bottom-10 left-6 h-20 w-20 overflow-hidden rounded-full border-4 border-surface bg-surface shadow-md sm:h-28 sm:w-28">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              priority
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${artist.coverColor}`} />
          )}
        </div>
      </div>

      <div className="mt-14 sm:mt-16">
        <p className="text-sm font-semibold text-accent-strong">
          {artist.genre} · {artist.location}
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">{artist.name}</h1>
        <p className="mt-1 text-muted">{artist.tagline}</p>
        <ArtistIntroduction artistId={artist.id} fallback={artist.introduction} />

        {hasLinks && (
          <div className="mt-4 flex items-center gap-2">
            {links.sns && (
              <a
                href={links.sns}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${artist.name} SNS`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-accent/50 hover:text-accent-strong"
              >
                <AtSign size={16} />
              </a>
            )}
            {links.youtube && (
              <a
                href={links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${artist.name} YouTube`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-accent/50 hover:text-accent-strong"
              >
                <PlayCircle size={16} />
              </a>
            )}
            {links.website && (
              <a
                href={links.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${artist.name} 공식 홈페이지`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-accent/50 hover:text-accent-strong"
              >
                <Globe size={16} />
              </a>
            )}
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-ink">음원 · 굿즈 · 티켓</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {artistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <ArtistFeed posts={artist.feedPosts ?? []} />

      <SupportersSection artistId={artist.id} baseSupporters={artist.supporters ?? []} />
    </div>
  );
}
