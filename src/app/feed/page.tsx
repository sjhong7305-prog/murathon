import { getSession } from "@/lib/auth";
import { LoginRequired } from "@/components/login-required";
import { getFollowedArtistsFeedPage } from "@/lib/artist-feed";
import { FeedInfiniteList } from "@/components/feed-infinite-list";

export default async function FollowedArtistsFeedPage() {
  const session = await getSession();
  if (!session) {
    return (
      <LoginRequired
        title="팬 로그인이 필요해요"
        description="로그인하면 내가 팔로우하는 아티스트의 새 소식을 모아볼 수 있어요."
      />
    );
  }

  const initial = await getFollowedArtistsFeedPage(session.user.id);

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-6 sm:px-0">
      <div>
        <p className="text-sm font-semibold text-accent-strong">🎧 피드</p>
        <h1 className="mt-1 text-2xl font-black text-ink">팔로우한 아티스트 소식</h1>
      </div>
      <div className="mt-6">
        <FeedInfiniteList
          endpoint="/api/feed"
          initialPosts={initial.posts}
          initialNextCursor={initial.nextCursor}
          emptyMessage="아직 표시할 소식이 없어요. 아티스트를 팔로우해보세요."
        />
      </div>
    </div>
  );
}
