import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getFanCollectionProfile } from "@/lib/fan-profile";
import { listPlaylistsForProfile } from "@/lib/playlists";
import { formatWon } from "@muraton/shared/format";
import { CoverArt } from "@/components/cover-art";
import { CollectionItemCard } from "@/components/collection-item-card";
import { CollectionTabs } from "@/components/collection-tabs";
import { TicketSection } from "@/components/ticket-section";
import { PrivacyToggle } from "@/components/privacy-toggle";
import { FollowFanButton } from "@/components/follow-fan-button";
import { CreatePlaylistButton } from "@/components/create-playlist-button";

type CollectionType = "all" | "music" | "merch" | "ticket";

export default async function FanCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string; type?: string }>;
}) {
  const { userId } = await params;
  const { tab, type } = await searchParams;
  const session = await getSession();
  const profile = await getFanCollectionProfile(userId, session?.user.id);
  if (!profile) notFound();

  const activeTab = tab === "playlists" ? "playlists" : "collection";
  const activeType: CollectionType =
    type === "music" || type === "merch" || type === "ticket" ? type : "all";

  const totalSpent = profile.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredItems =
    activeType === "all"
      ? profile.items
      : activeType === "music"
        ? profile.items.filter((i) => i.type === "ALBUM" || i.type === "TRACK")
        : activeType === "merch"
          ? profile.items.filter((i) => i.type === "MERCH")
          : profile.items.filter((i) => i.type === "TICKET");

  const playlists = await listPlaylistsForProfile(userId, profile.isOwner);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-black text-white">
          {profile.nickname.slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-semibold text-accent-strong">🎧 팬 컬렉션</p>
          <h1 className="text-2xl font-black text-ink">{profile.nickname}</h1>
          {profile.isOwner && <p className="text-sm text-muted">{profile.email}</p>}
          <p className="mt-0.5 text-xs text-muted">
            팔로워 {profile.followerCount} · 팔로잉 {profile.followingCount}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {profile.isOwner ? (
            <PrivacyToggle initialPrivacy={profile.privacy} />
          ) : (
            session && (
              <FollowFanButton userId={profile.userId} initialFollowing={profile.viewerIsFollowing} />
            )
          )}
        </div>
      </div>

      {profile.private ? (
        <div className="mt-10 rounded-xl border border-line bg-surface p-10 text-center">
          <p className="text-3xl">🔒</p>
          <p className="mt-2 text-sm font-bold text-ink">비공개 컬렉션이에요</p>
          <p className="mt-1 text-sm text-muted">{profile.nickname}님이 컬렉션을 비공개로 설정했어요.</p>
        </div>
      ) : (
        <>
          {profile.isOwner && (
            <section className="mt-8">
              <div className="grid grid-cols-3 gap-2 sm:max-w-md">
                <div className="rounded-xl border border-line bg-surface p-3 text-center">
                  <p className="text-lg font-black text-ink">{profile.followedArtists.length}</p>
                  <p className="text-xs text-muted">후원 아티스트</p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-3 text-center">
                  <p className="text-lg font-black text-ink">{profile.items.length}</p>
                  <p className="text-xs text-muted">총 구매 건수</p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-3 text-center">
                  <p className="truncate text-lg font-black text-ink">{formatWon(totalSpent)}</p>
                  <p className="text-xs text-muted">총 후원 금액</p>
                </div>
              </div>
            </section>
          )}

          {profile.followedArtists.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-lg font-bold text-ink">팔로잉 아티스트</h2>
              <div className="scrollbar-hide flex gap-3 overflow-x-auto overscroll-x-contain pb-2">
                {profile.followedArtists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.slug}`}
                    className="flex w-24 shrink-0 flex-col items-center gap-1.5 text-center"
                  >
                    <div className="w-16">
                      <CoverArt
                        gradient={artist.coverColor}
                        label={artist.name}
                        imageUrl={artist.imageUrl ?? undefined}
                        rounded="rounded-full"
                        hideLabel
                      />
                    </div>
                    <span className="truncate text-xs font-bold text-ink">{artist.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 flex gap-2 border-b border-line text-sm">
            <Link
              href={`/fans/${userId}`}
              className={`-mb-px border-b-2 px-3 py-2.5 font-bold transition ${
                activeTab === "collection"
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              컬렉션
            </Link>
            <Link
              href={`/fans/${userId}?tab=playlists`}
              className={`-mb-px border-b-2 px-3 py-2.5 font-bold transition ${
                activeTab === "playlists"
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              플레이리스트
            </Link>
          </div>

          {activeTab === "collection" ? (
            <section className="mt-6">
              <CollectionTabs
                userId={userId}
                active={activeType}
                counts={profile.counts}
                showTicket={profile.isOwner}
              />

              <div className="mt-6">
                {activeType === "ticket" ? (
                  <TicketSection
                    tickets={filteredItems.map((i) => ({
                      productId: i.productId,
                      title: i.title,
                      coverColor: i.coverColor,
                      imageUrl: i.imageUrl,
                      artistName: i.artistName,
                      artistSlug: i.artistSlug,
                      eventName: i.eventName,
                      venue: i.venue,
                      eventAt: i.eventAt?.toISOString(),
                      admissionCode: i.admissionCode,
                    }))}
                  />
                ) : filteredItems.length === 0 ? (
                  <div className="rounded-xl border border-line bg-surface p-6 text-center">
                    <p className="text-sm text-muted">아직 후원한 음원/굿즈가 없어요.</p>
                    <Link
                      href="/"
                      className="mt-3 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-strong"
                    >
                      아티스트 둘러보기
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredItems.map((item) => (
                      <CollectionItemCard
                        key={item.productId}
                        item={{
                          ...item,
                          purchasedAt: item.purchasedAt.toISOString(),
                          eventAt: item.eventAt?.toISOString(),
                          note: item.note
                            ? { message: item.note.message, updatedAt: item.note.updatedAt.toISOString() }
                            : null,
                        }}
                        editable={profile.isOwner}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="mt-6">
              {profile.isOwner && (
                <div className="mb-4">
                  <CreatePlaylistButton />
                </div>
              )}

              {playlists.length === 0 ? (
                <div className="rounded-xl border border-line bg-surface p-6 text-center">
                  <p className="text-sm text-muted">
                    {profile.isOwner ? "아직 만든 플레이리스트가 없어요." : "공개된 플레이리스트가 없어요."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {playlists.map((p) => (
                    <Link
                      key={p.id}
                      href={`/playlists/${p.id}`}
                      className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3 transition hover:border-accent/40"
                    >
                      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-3xl text-white">
                        🎵
                      </div>
                      <div>
                        <p className="truncate text-sm font-bold text-ink">{p.title}</p>
                        <p className="text-xs text-muted">
                          {p.trackCount}곡{!p.isPublic ? " · 비공개" : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
