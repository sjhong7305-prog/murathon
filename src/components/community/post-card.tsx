import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { CommunityPost } from "@/lib/community-storage";
import { Avatar } from "./avatar";
import { MiniTrackCard } from "./mini-track-card";
import { PostActions } from "./post-actions";

export function PostCard({
  post,
  commentCount,
}: {
  post: CommunityPost;
  commentCount: number;
}) {
  const isArtist = post.authorType === "artist";

  return (
    <div
      className={`rounded-2xl p-4 transition hover:shadow-[0_8px_24px_-16px_rgba(42,42,42,0.3)] sm:p-5 ${
        isArtist ? "border-2 border-accent/50 bg-accent/[0.03]" : "border border-line bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={post.author} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-ink">{post.author}</span>
            {isArtist && (
              <span
                title="인증된 아티스트"
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
              >
                ✓
              </span>
            )}
            <span className="shrink-0 text-xs text-muted">{formatDate(post.createdAt)}</span>
          </div>

          <Link href={`/community/${post.id}`} className="block">
            <p className="mt-1 font-bold text-ink hover:underline">{post.title}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{post.body}</p>
          </Link>

          {post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-strong"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.attachedProduct && <MiniTrackCard product={post.attachedProduct} />}

          <PostActions postId={post.id} commentCount={commentCount} />
        </div>
      </div>
    </div>
  );
}
