import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteHeroFeatureAction, updateHeroSettingsAction } from "./actions";
import { HeroSettingsForm } from "./hero-settings-form";

const LABEL_TEXT: Record<string, string> = {
  BEST_OF_WEEK: "이번주 베스트",
  TRENDING: "요즘 뜨는",
};

export default async function BackofficeHeroPage() {
  await requireAdmin();

  const [heroFeatures, heroSettings] = await Promise.all([
    prisma.heroFeature.findMany({
      include: { artist: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.heroSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">히어로 섹션</h1>
          <p className="mt-1 text-sm text-muted">
            홈 화면 상단 배너에 노출할 아티스트와 이미지를 관리합니다.
          </p>
        </div>
        <Link
          href="/backoffice/hero/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          + 히어로 이미지 추가
        </Link>
      </div>

      <div className="mt-6">
        <HeroSettingsForm
          action={updateHeroSettingsAction}
          defaultValues={{
            headline: heroSettings.headline,
            subtext: heroSettings.subtext,
            position: heroSettings.position,
          }}
        />
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {heroFeatures.length === 0 && (
          <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
            등록된 히어로 이미지가 없습니다. 추가하기 전까지는 홈 화면에 기본 아티스트 사진이 순환 노출됩니다.
          </p>
        )}

        {heroFeatures.map((feature) => {
          const displayName = feature.customName ?? feature.artist?.name ?? "(이름 없음)";
          return (
          <div
            key={feature.id}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4"
          >
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-cream">
              <Image src={feature.imageUrl} alt={displayName} fill sizes="96px" className="object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent-strong">
                  {LABEL_TEXT[feature.label]}
                </span>
                <p className="truncate font-bold text-ink">{displayName}</p>
                {!feature.artist && (
                  <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    직접 입력
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">
                {feature.customSubtitle ? `${feature.customSubtitle} · ` : ""}정렬 순서 {feature.sortOrder}
              </p>
            </div>

            <Link
              href={`/backoffice/hero/${feature.id}/edit`}
              className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent/50 hover:text-accent-strong"
            >
              수정
            </Link>
            <form action={deleteHeroFeatureAction.bind(null, feature.id)}>
              <button
                type="submit"
                className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-red-300 hover:text-red-600"
              >
                삭제
              </button>
            </form>
          </div>
          );
        })}
      </div>
    </div>
  );
}
