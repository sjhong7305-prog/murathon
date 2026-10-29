import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@muraton/db";
import { LoginRequired } from "@/components/login-required";
import { CoverArt } from "@/components/cover-art";
import { formatDate } from "@muraton/shared/format";

export default async function FollowFeedPage() {
  const session = await getSession();
  if (!session) {
    return (
      <LoginRequired
        title="팬 로그인이 필요해요"
        description="로그인하면 내가 팔로우하는 팬들의 최근 후원 소식을 볼 수 있어요."
      />
    );
  }

  const following = await prisma.fanFollow.findMany({
    where: { followerUserId: session.user.id },
    select: { followingUserId: true },
  });
  const followingIds = following.map((f) => f.followingUserId);

  const publicFans = followingIds.length
    ? await prisma.user.findMany({
        where: { id: { in: followingIds }, collectionPrivacy: "PUBLIC" },
        select: { id: true, nickname: true },
      })
    : [];
  const publicFanIds = publicFans.map((f) => f.id);
  const nicknameByUserId = new Map(publicFans.map((f) => [f.id, f.nickname]));

  const orderItems = publicFanIds.length
    ? await prisma.orderItem.findMany({
        where: { order: { buyerUserId: { in: publicFanIds } } },
        include: { product: { include: { artist: true } }, order: true },
        orderBy: { order: { createdAt: "desc" } },
        take: 50,
      })
    : [];

  const notes = orderItems.length
    ? await prisma.supporterNote.findMany({
        where: {
          userId: { in: publicFanIds },
          productId: { in: orderItems.map((i) => i.productId) },
        },
      })
    : [];
  const noteByKey = new Map(notes.map((n) => [`${n.userId}:${n.productId}`, n]));

  const items = orderItems.map((item) => {
    const userId = item.order.buyerUserId as string;
    return {
      userId,
      nickname: nicknameByUserId.get(userId) ?? "팬",
      productId: item.productId,
      title: item.product.title,
      type: item.product.type,
      coverColor: item.product.coverColor,
      imageUrl: item.product.imageUrl,
      artistName: item.product.artist.name,
      artistSlug: item.product.artist.slug,
      purchasedAt: item.order.createdAt,
      note: noteByKey.get(`${userId}:${item.productId}`)?.message ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-ink">내가 팔로우하는 팬들의 소식</h1>

      {followingIds.length === 0 ? (
        <div className="mt-10 rounded-xl border border-line bg-surface p-10 text-center">
          <p className="text-sm text-muted">아직 팔로우하는 팬이 없어요.</p>
          <p className="mt-1 text-xs text-muted">다른 팬의 컬렉션 페이지에서 팔로우해보세요.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-line bg-surface p-10 text-center">
          <p className="text-sm text-muted">아직 표시할 소식이 없어요.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {items.map((item, idx) => (
            <div key={`${item.userId}-${item.productId}-${idx}`} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
              <Link href={`/products/${item.productId}`} className="w-16 shrink-0">
                <CoverArt gradient={item.coverColor} label={item.title} type={item.type} imageUrl={item.imageUrl ?? undefined} hideLabel />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">
                  <Link href={`/fans/${item.userId}`} className="font-bold hover:text-accent-strong">
                    {item.nickname}
                  </Link>
                  님이{" "}
                  <Link href={`/artists/${item.artistSlug}`} className="font-semibold hover:text-accent-strong">
                    {item.artistName}
                  </Link>
                  의{" "}
                  <Link href={`/products/${item.productId}`} className="font-semibold hover:underline">
                    {item.title}
                  </Link>
                  을(를) 후원했어요
                </p>
                {item.note && (
                  <p className="mt-1.5 rounded-lg bg-cream px-2.5 py-1.5 text-xs italic text-ink">
                    &ldquo;{item.note}&rdquo;
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted">{formatDate(item.purchasedAt.toISOString())}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
