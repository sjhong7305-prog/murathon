"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { addLocalPost, type AuthorType } from "@/lib/community-storage";
import { artists } from "@/lib/data";
import { AuthorBadge } from "@/components/author-badge";

const ME = artists[0];

export default function NewCommunityPostPage() {
  const router = useRouter();
  const { session } = useAuth();

  const [authorType, setAuthorType] = useState<AuthorType>(
    session === "artist" ? "artist" : "follower"
  );
  const [author, setAuthor] = useState(session === "artist" ? ME?.name ?? "" : "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (session !== "follower") return;
    try {
      const raw = window.sessionStorage.getItem("muraton-last-order");
      if (raw) {
        const order = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill nickname from the follower's last completed order
        if (order?.name) setAuthor(order.name);
      }
    } catch {
      // ignore malformed order snapshot
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const post = addLocalPost({ title, body, author, authorType });
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

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {session === null ? (
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

        <p className="text-xs text-muted">
          프로토타입이므로 작성한 글은 이 브라우저에만 저장됩니다.
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
