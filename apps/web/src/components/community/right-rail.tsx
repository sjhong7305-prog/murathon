import Link from "next/link";
import { CoverArt } from "@/components/cover-art";
import type { CommunityPost } from "@/lib/community-storage";
import type { Product } from "@muraton/shared/types";

export function RightRail({
  hotPosts,
  trendingTracks,
}: {
  hotPosts: { post: CommunityPost; commentCount: number }[];
  trendingTracks: Product[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-surface p-5">
        <p className="text-sm font-bold text-ink">Hot Debates</p>
        {hotPosts.length === 0 ? (
          <p className="mt-2 text-xs text-muted">아직 댓글이 달린 글이 없어요.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {hotPosts.map(({ post, commentCount }) => (
              <li key={post.id}>
                <Link href={`/community/${post.id}`} className="group block">
                  <p className="truncate text-sm font-semibold text-ink group-hover:text-accent-strong">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted">댓글 {commentCount}개</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-surface p-5">
        <p className="text-sm font-bold text-ink">지금 뜨는 트랙</p>
        {trendingTracks.length === 0 ? (
          <p className="mt-2 text-xs text-muted">아직 등록된 트랙이 없어요.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {trendingTracks.map((track) => (
              <li key={track.id}>
                <Link href={`/products/${track.id}`} className="flex items-center gap-2.5 group">
                  <div className="w-10 shrink-0">
                    <CoverArt
                      gradient={track.coverColor}
                      label={track.title}
                      imageUrl={track.imageUrl}
                      hideLabel
                      rounded="rounded-md"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink group-hover:text-accent-strong">
                      {track.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
