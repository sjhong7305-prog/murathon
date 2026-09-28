import { notFound } from "next/navigation";
import { requireArtistMember } from "@/lib/auth";
import { getProductById } from "@/lib/data";
import { TrackReleaseForm } from "@/components/track-release-form";

export default async function EditReleasePage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const { artist } = await requireArtistMember(slug);

  const product = await getProductById(productId);
  // Ownership and type mismatches are both reported as "not found" rather than 403 — same
  // principle as the feed/notice gating elsewhere: a mismatched resource's existence isn't leaked.
  if (!product || product.artistId !== artist.id) notFound();
  if (product.type !== "track") notFound(); // self-service edit is scoped to TRACK releases only

  return (
    <TrackReleaseForm
      mode="edit"
      artistId={artist.id}
      artistSlug={artist.slug}
      productId={product.id}
      initial={{
        title: product.title,
        genre: product.genre ?? "",
        description: product.description,
        imageUrl: product.imageUrl,
        previewAudioUrl: product.previewAudioUrl,
        durationSec: product.durationSec,
        minPrice: product.minPrice,
        suggestedPrice: product.suggestedPrice,
        releaseType: product.releaseType ?? "single",
        status: product.status,
      }}
    />
  );
}
