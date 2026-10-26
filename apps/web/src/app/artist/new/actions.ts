"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { getSession, createArtistProfile } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos-storage";

export interface ArtistNewActionState {
  error?: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

async function resolveImageUrl(formData: FormData, slug: string): Promise<string> {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) {
    return "";
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("프로필 이미지는 jpg, png, webp 파일만 업로드할 수 있어요.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("프로필 이미지는 5MB 이하로 업로드해주세요.");
  }

  const filename = `${slug}-avatar-${randomUUID()}${EXT_BY_TYPE[file.type]}`;
  const uploaded = await uploadToCos("artists", file, filename);
  return uploaded.url;
}

export async function artistNewAction(
  _prevState: ArtistNewActionState | undefined,
  formData: FormData
): Promise<ArtistNewActionState> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("address") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const genre = String(formData.get("genre") ?? "").trim();

  if (!name) {
    return { error: "활동명을 입력해주세요." };
  }
  if (!slug) {
    return { error: "페이지 주소를 입력해주세요." };
  }

  let imageUrl: string;
  try {
    imageUrl = await resolveImageUrl(formData, slug);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "이미지 업로드에 실패했어요." };
  }

  const result = await createArtistProfile(session.user.id, { name, slug, bio, genre, imageUrl });
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(`/artist/${result.slug}/dashboard`);
}
