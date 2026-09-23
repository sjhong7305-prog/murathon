"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { artistNewAction, type ArtistNewActionState } from "./actions";

const initialState: ArtistNewActionState = {};

function slugify(base: string) {
  return base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArtistNewForm() {
  const [state, formAction, pending] = useActionState(artistNewAction, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold text-accent-strong">🎸 아티스트 페이지 만들기</p>
      <h1 className="mt-1 text-2xl font-black text-ink">활동명과 slug만 정하면 바로 시작해요</h1>
      <p className="mt-2 text-sm text-muted">
        소개, 장르, 이미지는 나중에 언제든 채울 수 있어요. 정산 정보는 실제 공개/출금 시점에 받아요.
      </p>

      <form action={formAction} encType="multipart/form-data" className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">활동명</label>
          <input
            required
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="원더 스태틱"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">slug (페이지 주소)</label>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 focus-within:border-accent">
            <span className="shrink-0 text-sm text-muted">murathon.com/artists/</span>
            <input
              required
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              className="min-w-0 flex-1 bg-transparent text-ink outline-none"
              placeholder="wonder-static"
            />
          </div>
          <p className="mt-1 text-xs text-muted">영문 소문자, 숫자, 하이픈(-)만 사용할 수 있어요.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">소개 (선택)</label>
          <textarea
            name="bio"
            rows={3}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="어떤 음악을 하는 아티스트인가요?"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">장르 (선택)</label>
          <input
            name="genre"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="예: 힙합 / 솔로, 밴드, 재즈 등"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">프로필 이미지 (선택)</label>

          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt=""
              className="mb-2 h-24 w-24 rounded-full border border-line object-cover"
            />
          )}

          <input
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:transition hover:file:bg-accent-strong"
          />
          <p className="mt-2 text-xs text-muted">
            내 컴퓨터의 이미지를 업로드하거나, 아래에 외부 이미지 URL을 입력하세요. 파일을 선택하면 URL 값은 무시돼요.
          </p>
          <input
            type="url"
            name="imageUrl"
            className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="https://..."
          />
        </div>

        {state?.error && (
          <p className="text-sm font-semibold text-rose-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "만드는 중..." : "아티스트 페이지 만들기"}
        </button>
      </form>
    </div>
  );
}
