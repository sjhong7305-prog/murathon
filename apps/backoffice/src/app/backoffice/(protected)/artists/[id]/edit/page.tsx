import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { ArtistForm } from "../../artist-form";
import { updateArtistAction } from "../../actions";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) notFound();

  const action = updateArtistAction.bind(null, artist.id);

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/artists" className="text-sm font-semibold text-muted hover:text-ink">
        ← 아티스트
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-black text-ink">{artist.name} 수정</h1>
      <ArtistForm
        action={action}
        submitLabel="저장"
        defaultValues={{
          slug: artist.slug,
          name: artist.name,
          genre: artist.genre,
          genreTags: artist.genreTags,
          location: artist.location,
          tagline: artist.tagline,
          introduction: artist.introduction,
          coverColor: artist.coverColor,
          imageUrl: artist.imageUrl,
          bannerImage: artist.bannerImage,
          snsLink: artist.snsLink,
          youtubeLink: artist.youtubeLink,
          websiteLink: artist.websiteLink,
          checkoutQuestion: artist.checkoutQuestion,
        }}
      />
    </div>
  );
}
