import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { HeroFeatureForm } from "../hero-feature-form";
import { createHeroFeatureAction } from "../actions";

export default async function NewHeroFeaturePage() {
  await requireAdmin();

  const artists = await prisma.artist.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/hero" className="text-sm font-semibold text-muted hover:text-ink">
        ← 히어로 섹션
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-black text-ink">히어로 이미지 추가</h1>
      <HeroFeatureForm action={createHeroFeatureAction} artists={artists} submitLabel="추가" />
    </div>
  );
}
