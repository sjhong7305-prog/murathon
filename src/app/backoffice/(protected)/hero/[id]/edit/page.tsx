import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { HeroFeatureForm } from "../../hero-feature-form";
import { updateHeroFeatureAction } from "../../actions";

export default async function EditHeroFeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [heroFeature, artists] = await Promise.all([
    prisma.heroFeature.findUnique({ where: { id }, include: { artist: true } }),
    prisma.artist.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!heroFeature) notFound();

  const action = updateHeroFeatureAction.bind(null, heroFeature.id);
  const displayName = heroFeature.customName ?? heroFeature.artist?.name ?? "히어로 이미지";

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/hero" className="text-sm font-semibold text-muted hover:text-ink">
        ← 히어로 섹션
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-black text-ink">{displayName} 수정</h1>
      <HeroFeatureForm
        action={action}
        artists={artists}
        submitLabel="저장"
        defaultValues={{
          artistId: heroFeature.artistId ?? undefined,
          customName: heroFeature.customName ?? undefined,
          customSubtitle: heroFeature.customSubtitle ?? undefined,
          label: heroFeature.label,
          imageUrl: heroFeature.imageUrl,
          sortOrder: heroFeature.sortOrder,
        }}
      />
    </div>
  );
}
