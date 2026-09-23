"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-log";

function readArtistFields(formData: FormData) {
  const genreTagsRaw = String(formData.get("genreTags") ?? "");
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    genre: String(formData.get("genre") ?? "").trim(),
    genreTags: genreTagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    location: String(formData.get("location") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    introduction: String(formData.get("introduction") ?? "").trim(),
    coverColor: String(formData.get("coverColor") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    bannerImage: String(formData.get("bannerImage") ?? "").trim() || null,
    snsLink: String(formData.get("snsLink") ?? "").trim() || null,
    youtubeLink: String(formData.get("youtubeLink") ?? "").trim() || null,
    websiteLink: String(formData.get("websiteLink") ?? "").trim() || null,
    checkoutQuestion: String(formData.get("checkoutQuestion") ?? "").trim() || null,
  };
}

export async function updateArtistAction(artistId: string, formData: FormData) {
  const session = await requireAdmin();
  const fields = readArtistFields(formData);

  await prisma.artist.update({ where: { id: artistId }, data: fields });

  await logAdminAction({
    actorId: session.user.id,
    action: "artist.update",
    targetType: "Artist",
    targetId: artistId,
  });

  revalidatePath("/backoffice/artists");
  revalidatePath(`/backoffice/artists/${artistId}/edit`);
  revalidatePath(`/artists/${fields.slug}`);
  redirect("/backoffice/artists");
}
