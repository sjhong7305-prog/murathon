import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

export default async function BackofficeCommunityPage() {
  await requireAdmin();

  const posts = await prisma.communityPost.findMany({
    include: { _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-ink">커뮤니티</h1>

      <div className="mt-6 flex flex-col gap-2">
        {posts.length === 0 && (
          <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
            게시글이 없습니다.
          </p>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/backoffice/community/${post.id}`}
            className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink">{post.title}</p>
              <p className="text-sm text-muted">
                {post.authorNickname} · {post.authorType === "ARTIST" ? "아티스트" : "팔로워"} ·{" "}
                {formatDateTime(post.createdAt)}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted">댓글 {post._count.comments}개</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
