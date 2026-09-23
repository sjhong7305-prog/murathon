"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatWon } from "@/lib/format";
import { TagInput } from "@/components/tag-input";
import { useAuth } from "@/context/auth-context";
import { LoginRequired } from "@/components/login-required";
import { useCatalog } from "@/lib/use-catalog";

const MAX_QUESTIONS = 8;

export default function UploadPage() {
  const { slug } = useParams<{ slug: string }>();
  const { loading, activeArtist, activeArtistId } = useAuth();
  const catalog = useCatalog();
  const me = activeArtistId ? catalog?.getArtistById(activeArtistId) : undefined;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);

  const [askQuestion, setAskQuestion] = useState(false);
  const [checkoutQuestions, setCheckoutQuestions] = useState<string[]>([""]);

  const [provideSecret, setProvideSecret] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");
  const [secretFileName, setSecretFileName] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setCoverFileName(file?.name ?? null);
  };

  const handleSecretFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretFileName(e.target.files?.[0]?.name ?? null);
  };

  const toggleAskQuestion = (checked: boolean) => {
    setAskQuestion(checked);
    if (checked && checkoutQuestions.length === 0) {
      setCheckoutQuestions([""]);
    }
  };

  const addQuestion = () => {
    setCheckoutQuestions((prev) =>
      prev.length >= MAX_QUESTIONS ? prev : [...prev, ""]
    );
  };

  const updateQuestion = (index: number, value: string) => {
    setCheckoutQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

  const removeQuestion = (index: number) => {
    setCheckoutQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const finalQuestions = askQuestion
    ? checkoutQuestions.map((q) => q.trim()).filter(Boolean)
    : [];

  if (loading) return null;
  if (!activeArtist || activeArtist.slug !== slug) return <LoginRequired />;

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-black text-ink">업로드가 완료됐어요</h1>
        <p className="mt-2 text-muted">
          “{title || "제목 없음"}”이(가) 등록됐어요. (프로토타입 목업, 실제로 저장되지 않습니다)
        </p>

        <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-left text-sm">
          <div className="flex justify-between text-ink">
            <span>최소 가격</span>
            <span className="font-bold text-ink">{formatWon(Number(minPrice) || 0)}</span>
          </div>
          {genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 border-t border-line pt-2">
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent-strong"
                >
                  #{g}
                </span>
              ))}
            </div>
          )}
          {finalQuestions.length > 0 && (
            <div className="mt-2 border-t border-line pt-2 text-ink">
              <p>💬 체크아웃 질문 {finalQuestions.length}개</p>
              <ul className="mt-1 list-inside list-disc text-ink">
                {finalQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {provideSecret && (
            <div className="mt-2 border-t border-line pt-2 text-ink">
              🔒 시크릿 콘텐츠 제공됨
              {secretFileName && <span className="text-ink"> · {secretFileName}</span>}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={`/artist/${slug}/dashboard`}
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-black text-ink">새 릴리즈 업로드</h1>
      <p className="mt-1 text-sm text-muted">
        음원이나 굿즈를 등록하고 팬 인터랙션 설정을 조정해보세요.
      </p>

      {me && me.payoutStatus !== "VERIFIED" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="text-sm text-amber-800">
            💳 공개된 릴리즈를 실제로 판매하려면 정산 정보 등록이 필요해요.
          </p>
          <Link
            href={`/artist/${slug}/dashboard/payouts`}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-accent-strong"
          >
            정산 정보 등록
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted">릴리즈 제목</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="예: 잔상 (정규 2집)"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">커버 이미지</label>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line bg-surface p-4 transition hover:border-accent/50">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="커버 미리보기"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface text-2xl">
                  🖼️
                </span>
              )}
              <span className="text-sm text-muted">
                {coverFileName ?? "이미지를 선택하거나 드래그해서 업로드하세요"}
              </span>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">설명</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="팬들에게 이 릴리즈를 소개해주세요"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">장르</label>
            <TagInput
              tags={genres}
              onChange={setGenres}
              placeholder="장르를 입력하고 Enter 또는 스페이스 (예: HipHop, Solo, Band, Jazz)"
            />
            <p className="mt-1 text-xs text-muted">
              힙합, 솔로, 밴드, 재즈 등 장르에 상관없이 여러 개를 해시태그로 추가할 수 있어요.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">최소 가격 (PWYW 설정)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={100}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-40 rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              />
              <span className="text-sm text-muted">원</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              0원으로 설정하면 팬이 완전히 자유롭게 가격을 정할 수 있어요.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm font-bold text-ink">인터랙션 설정 (선택)</p>
          <p className="mt-0.5 text-xs text-muted">
            팬과의 상호작용 방식을 자유롭게 조정할 수 있어요.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={askQuestion}
                  onChange={(e) => toggleAskQuestion(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                체크아웃에서 팬에게 질문하기
              </label>

              {askQuestion && (
                <div className="mt-2 flex flex-col gap-2">
                  {checkoutQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={q}
                        onChange={(e) => updateQuestion(idx, e.target.value)}
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
                        placeholder={`질문 ${idx + 1} (예: 가장 좋아하는 곡은 무엇인가요?)`}
                      />
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-rose-400/50 hover:text-rose-400"
                      >
                        삭제
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addQuestion}
                    disabled={checkoutQuestions.length >= MAX_QUESTIONS}
                    className="self-start rounded-full border border-line px-4 py-2 text-xs font-bold text-ink transition hover:border-accent/50 hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
                  >
                    + 질문 추가 ({checkoutQuestions.length}/{MAX_QUESTIONS})
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={provideSecret}
                  onChange={(e) => setProvideSecret(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                구매자에게 시크릿 콘텐츠 제공
              </label>
              {provideSecret && (
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={secretMessage}
                    onChange={(e) => setSecretMessage(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
                    placeholder="시크릿 감사 메시지를 남겨주세요"
                  />
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line bg-surface px-3 py-2 text-xs text-muted transition hover:border-accent/50">
                    <span>📎 {secretFileName ?? "히든 트랙/이미지 첨부 (선택)"}</span>
                    <input type="file" onChange={handleSecretFileChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted">
          프로토타입이므로 실제로 파일이 저장되거나 릴리즈가 등록되지 않습니다.
        </p>

        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          릴리즈 업로드하기
        </button>
      </form>
    </div>
  );
}
