import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@muraton/db";
import { formatDateTime } from "@muraton/shared/format";
import { deletePostAction, deleteCommentAction } from "../actions";

export default async function BackofficeCommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: { comments: { orderBy: { createdAt: "asc" } } },
  });
  if (!post) notFound();

  const deletePost = deletePostAction.bind(null, post.id);

  return (
    <div className="max-w-2xl">
      <Link href="/backoffice/community" className="text-sm font-semibold text-muted hover:text-ink">
        ← 커뮤니티
      </Link>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-bold text-ink">{post.authorNickname}</span>
            <span>{post.authorType === "ARTIST" ? "🎸 아티스트" : "🎧 팔로워"}</span>
            <span>{formatDateTime(post.createdAt)}</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-ink">{post.title}</h1>
        </div>
        <form action={deletePost}>
          <button
            type="submit"
            className="shrink-0 rounded-full border border-rose-300 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
          >
            글 삭제
          </button>
        </form>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">{post.body}</p>

      <div className="mt-8">
        <p className="mb-2 text-sm font-bold text-ink">댓글 ({post.comments.length})</p>
        {post.comments.length === 0 && <p className="text-sm text-muted">댓글이 없습니다.</p>}
        <div className="flex flex-col gap-2">
          {post.comments.map((comment) => {
            const deleteComment = deleteCommentAction.bind(null, post.id, comment.id);
            return (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-bold text-ink">{comment.authorNickname}</span>
                    <span>{comment.authorType === "ARTIST" ? "🎸" : "🎧"}</span>
                    <span>{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-ink">{comment.message}</p>
                </div>
                <form action={deleteComment}>
                  <button
                    type="submit"
                    className="shrink-0 text-xs font-semibold text-muted hover:text-rose-600"
                  >
                    삭제
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
