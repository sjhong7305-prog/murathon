import { notFound } from "next/navigation";
import Link from "next/link";
import { getArtistBySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { serializeCommunityPost } from "@/lib/community-serialize";
import { PostCard } from "@/components/community/post-card";

export default async function ArtistCommunityTab({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const rows = await prisma.communityPost.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" },
    include: {
      comments: { orderBy: { createdAt: "asc" } },
      attachedProduct: { include: { artist: { select: { name: true } } } },
    },
  });
  // serializeCommunityPost returns Date objects — fine when handed straight to NextResponse.json()
  // (which stringifies dates), but this is a server component passing props directly, so convert
  // to the same ISO-string shape the client-side CommunityPost type (and PostCard) expects.
  const posts = rows.map(serializeCommunityPost).map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm opacity-70" style={{ color: "var(--artist-text)" }}>
          팬들이 {artist.name}에 대해 나눈 이야기예요.
        </p>
        <Link
          href={`/community/new?artistId=${artist.id}`}
          className="shrink-0 rounded-full px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: "var(--artist-accent)" }}
        >
          글쓰기
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm opacity-70" style={{ color: "var(--artist-text)" }}>
          아직 커뮤니티 글이 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} commentCount={post.comments.length} />
          ))}
        </div>
      )}
    </div>
  );
}
