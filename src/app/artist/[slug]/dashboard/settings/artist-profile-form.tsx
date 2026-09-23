"use client";

import { useState } from "react";
import type { Artist } from "@/lib/types";
import { TagInput } from "@/components/tag-input";
import { COVER_COLORS } from "@/lib/cover-colors";
import { MAX_BANNER_BYTES } from "@/lib/artist-image-limits";

export function ArtistProfileForm({ artist }: { artist: Artist }) {
  const [name, setName] = useState(artist.name);
  const [bio, setBio] = useState(artist.introduction);
  const [genres, setGenres] = useState<string[]>(
    artist.genre.split("/").map((g) => g.trim()).filter(Boolean)
  );
  const [snsLink, setSnsLink] = useState(artist.externalLinks?.sns ?? "");
  const [coverColor, setCoverColor] = useState(artist.coverColor);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("genre", genres.join(" / "));
      formData.append("introduction", bio);
      formData.append("coverColor", coverColor);
      formData.append("snsLink", snsLink);
      if (bannerFile) formData.append("bannerImage", bannerFile);

      const res = await fetch(`/api/artists/${artist.id}/profile`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setProfileError(data.error ?? "저장하지 못했어요.");
        return;
      }
      setBannerFile(null);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-muted">아티스트 / 밴드명</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">소개</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">장르</label>
        <TagInput
          tags={genres}
          onChange={setGenres}
          placeholder="장르 입력 후 Enter (예: HipHop, Solo, Band, Jazz)"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">SNS / 포트폴리오 링크</label>
        <input
          type="url"
          value={snsLink}
          onChange={(e) => setSnsLink(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          placeholder="https://instagram.com/yourband"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">테마 컬러</label>
        <div className="flex flex-wrap gap-2">
          {COVER_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCoverColor(c)}
              aria-label={c}
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${c} transition ${
                coverColor === c ? "ring-2 ring-accent ring-offset-2 ring-offset-cream" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">
        배너 이미지, 색상, 글꼴 등 더 다양한 외모 설정은 아래 &ldquo;페이지 디자인&rdquo;에서 할 수 있어요.
      </p>

      <div>
        <label className="mb-1 block text-sm text-muted">배너 이미지</label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-surface p-4 transition hover:border-accent/50">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cream text-xl">
            🖼️
          </span>
          <span className="text-sm text-muted">
            {bannerFile ? bannerFile.name : "새 배너 이미지를 선택하세요 (10MB 이하)"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.size > MAX_BANNER_BYTES) {
                setProfileError("배너 이미지는 10MB 이하로 업로드해주세요.");
                e.target.value = "";
                return;
              }
              setProfileError(null);
              setBannerFile(file);
            }}
            className="hidden"
          />
        </label>
      </div>

      {profileError && (
        <p className="text-sm font-semibold text-rose-600" role="alert">
          {profileError}
        </p>
      )}

      <button
        type="submit"
        disabled={profileSaving}
        className="self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
      >
        {profileSaving ? "저장 중..." : profileSaved ? "저장됐어요 ✓" : "프로필 저장"}
      </button>
    </form>
  );
}
