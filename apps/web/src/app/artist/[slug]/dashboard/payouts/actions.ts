"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireArtistMember } from "@/lib/auth";
import { prisma } from "@muraton/db";

/**
 * Stub only — no real bank verification. Prototype just records that the artist submitted
 * payout details and flips payoutStatus to PENDING so the dashboard gate clears.
 */
export async function payoutInfoAction(slug: string, formData: FormData) {
  const { artist } = await requireArtistMember(slug);

  const bankName = String(formData.get("bankName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const accountHolder = String(formData.get("accountHolder") ?? "").trim();

  if (!bankName || !accountNumber || !accountHolder) {
    return;
  }

  await prisma.artist.update({
    where: { id: artist.id },
    data: { payoutStatus: "PENDING" },
  });

  revalidatePath(`/artist/${slug}/dashboard`);
  redirect(`/artist/${slug}/dashboard`);
}
