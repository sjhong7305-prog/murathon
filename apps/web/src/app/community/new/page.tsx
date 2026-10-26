"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { addLocalPost, type AuthorType } from "@/lib/community-storage";
import { useCatalog } from "@/lib/use-catalog";
import { AuthorBadge } from "@/components/author-badge";
import { TagInput } from "@/components/tag-input";
import { CoverArt } from "@/components/cover-art";

export default function NewCommunityPostPage() {
  return (
    <Suspense fallback={null}>
      <NewCommunityPostPageInner />
    </Suspense>
  );
}

function NewCommunityPostPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scopedArtistId = searchParams.get("artistId") || undefined;
  const { isLoggedIn, activeArtist, nickname } = useAuth();
  const catalog = useCatalog();
  const scopedArtist = scopedArtistId ? catalog?.getArtistById(scopedArtistId) : undefined;

  const [authorType, setAuthorType] = useState<AuthorType>(
    activeArtist ? "artist" : "follower"
  );
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachedProductId, setAttachedProductId] = useState("");

  const attachedProduct = catalog?.products.find((p) => p.id === attachedProductId);

  useEffect(() => {
    if (activeArtist) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill artist nickname once the session loads
      setAuthor(activeArtist.name);
      return;
    }
    if (!isLoggedIn) return;
    if (nickname) {
      setAuthor(nickname);
      return;
    }
    try {
      const raw = window.sessionStorage.getItem("muraton-last-order");
      if (raw) {
        const order = JSON.parse(raw);
        if (order?.name) setAuthor(order.name);
      }
    } catch {
      // ignore malformed order snapshot
    }
  }, [activeArtist, isLoggedIn, nickname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const post = await addLocalPost({
      title,
      body,
      author,
      authorType,
      tags,
      attachedProductId: attachedProductId || undefined,
      artistId: scopedArtistId,
    });
    router.push(`/community/${post.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm text-muted">
        <Link href="/community" className="hover:text-ink">
          커뮤니티
        </Link>{" "}
        / 글쓰기
      </p>
      <h1 className="mt-1 text-2xl font-black text-ink">새 글 작성</h1>
      {scopedArtist && (
        <p className="mt-2 rounded-lg bg-accent/10 px-3 py-2 text-sm font-semibold text-accent-strong">
          {scopedArtist.name} 커뮤니티에 글을 남겨요.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {!isLoggedIn ? (
          <div>
            <label className="mb-1 block text-sm text-muted">작성자 유형</label>
            <div className="grid grid-cols-2 gap-2 rounded-full border border-line bg-surface p-1">
              <button
                type="button"
                onClick={() => setAuthorType("follower")}
                className={`rounded-full py-2 text-sm font-bold transition ${
                  authorType === "follower"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                팔로워로 작성
              </button>
              <button
                type="button"
                onClick={() => setAuthorType("artist")}
                className={`rounded-full py-2 text-sm font-bold transition ${
                  authorType === "artist"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                아티스트로 작성
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>작성자 유형</span>
            <AuthorBadge type={authorType} />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-muted">닉네임</label>
          <input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="닉네임을 입력해주세요"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">제목</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="제목을 입력해주세요"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">내용</label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="자유롭게 이야기를 남겨주세요"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">태그 (선택, 최대 5개)</label>
          <TagInput tags={tags} onChange={setTags} placeholder="#IndiePop 처럼 입력 후 Enter" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">곡/앨범 공유하기 (선택)</label>
          <select
            value={attachedProductId}
            onChange={(e) => setAttachedProductId(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          >
            <option value="">공유하지 않음</option>
            {catalog?.products.map((p) => {
              const artist = catalog.getArtistById(p.artistId);
              return (
                <option key={p.id} value={p.id}>
                  {artist?.name ?? "아티스트"} - {p.title}
                </option>
              );
            })}
          </select>

          {attachedProduct && (
            <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-line bg-cream p-2">
              <div className="w-10 shrink-0">
                <CoverArt
                  gradient={attachedProduct.coverColor}
                  label={attachedProduct.title}
                  imageUrl={attachedProduct.imageUrl}
                  hideLabel
                  rounded="rounded-md"
                  sizes="40px"
                />
              </div>
              <p className="truncate text-sm font-semibold text-ink">{attachedProduct.title}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted">
          작성한 글은 커뮤니티에 공개로 등록됩니다.
        </p>

        <button
          type="submit"
          className="self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          등록하기
        </button>
      </form>
    </div>
  );
}
