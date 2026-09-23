"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Artist, Product } from "@/lib/types";
import type { FeedPage } from "@/lib/artist-feed";
import {
  ArtistTheme,
  ArtistThemeLink,
  DEFAULT_THEME,
  FONT_OPTIONS,
  GRADIENT_ANGLES,
  PRESETS,
  MAX_BIO_LENGTH,
  MAX_LINKS,
  MAX_LINK_LABEL_LENGTH,
  contrastRatio,
  resolveContrastBackground,
} from "@/lib/artist-theme";
import { ThemedArtistView } from "@/components/themed-artist-view";
import { artistFontClassName } from "@/lib/artist-fonts";
import { MAX_BANNER_BYTES, MAX_PROFILE_BYTES, MAX_BACKGROUND_BYTES } from "@/lib/artist-image-limits";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-muted">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-line bg-surface"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          className={`${FIELD_CLASS} font-mono text-sm`}
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );
}

export function AppearanceEditor({
  artist,
  initialTheme,
  products,
  initialFeed,
  followerCount,
  memberProfile,
}: {
  artist: Artist;
  initialTheme: ArtistTheme;
  products: Product[];
  initialFeed: FeedPage;
  followerCount: number;
  memberProfile: { id: string; displayName: string | null; imageUrl: string | null; roleLabel: string | null };
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<ArtistTheme>(initialTheme);
  const [introduction, setIntroduction] = useState(artist.introduction);
  const [membershipEnabled, setMembershipEnabled] = useState(artist.membershipEnabled ?? false);
  const [memberDisplayName, setMemberDisplayName] = useState(memberProfile.displayName ?? "");
  const [memberRoleLabel, setMemberRoleLabel] = useState(memberProfile.roleLabel ?? "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const updateColor = (key: keyof ArtistTheme["colors"], hex: string) => {
    setTheme((t) => ({ ...t, colors: { ...t.colors, [key]: hex } }));
  };

  const handleBannerFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_BANNER_BYTES) {
      setError("배너 이미지는 10MB 이하로 업로드해주세요.");
      e.target.value = "";
      return;
    }
    setError(null);
    setBannerFile(file ?? null);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleProfileFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_PROFILE_BYTES) {
      setError("프로필 이미지는 2MB 이하로 업로드해주세요.");
      e.target.value = "";
      return;
    }
    setError(null);
    setProfileFile(file ?? null);
    setProfilePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBackgroundFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_BACKGROUND_BYTES) {
      setError("배경 이미지는 5MB 이하로 업로드해주세요.");
      e.target.value = "";
      return;
    }
    setError(null);
    setBackgroundFile(file ?? null);
    setBackgroundPreview(file ? URL.createObjectURL(file) : null);
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTheme((t) => ({ ...preset.theme, links: t.links }));
  };

  const resetToDefault = () => {
    setTheme((t) => ({ ...DEFAULT_THEME, links: t.links }));
  };

  const updateLink = (index: number, patch: Partial<ArtistThemeLink>) => {
    setTheme((t) => ({
      ...t,
      links: t.links.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  };

  const addLink = () => {
    if (theme.links.length >= MAX_LINKS) return;
    setTheme((t) => ({ ...t, links: [...t.links, { label: "", url: "" }] }));
  };

  const removeLink = (index: number) => {
    setTheme((t) => ({ ...t, links: t.links.filter((_, i) => i !== index) }));
  };

  const contrastBase = resolveContrastBackground(theme.background, theme.colors, theme.colors.text);
  const contrastValue = contrastRatio(contrastBase, theme.colors.text);
  const lowContrast = contrastValue < 4.5;

  const previewArtist: Artist = {
    ...artist,
    introduction,
    bannerImage: bannerPreview ?? artist.bannerImage,
    imageUrl: profilePreview ?? artist.imageUrl,
    membershipEnabled,
  };
  const previewTheme: ArtistTheme = {
    ...theme,
    background:
      theme.background.type === "image" && backgroundPreview
        ? { ...theme.background, imageUrl: backgroundPreview }
        : theme.background,
  };

  const handleSubmit = async () => {
    setError(null);
    setPending(true);
    setSavedNotice(false);
    try {
      if (introduction.length > MAX_BIO_LENGTH) {
        setError(`소개는 ${MAX_BIO_LENGTH}자 이내로 작성해주세요.`);
        return;
      }
      for (const link of theme.links) {
        if (!link.label.trim() || !link.url.trim()) {
          setError("링크는 이름과 주소를 모두 입력하거나, 비워둘 링크는 삭제해주세요.");
          return;
        }
      }

      const formData = new FormData();
      formData.set("theme", JSON.stringify(theme));
      formData.set("introduction", introduction);
      formData.set("membershipEnabled", String(membershipEnabled));
      if (bannerFile) formData.set("bannerImage", bannerFile);
      if (profileFile) formData.set("profileImage", profileFile);
      if (backgroundFile) formData.set("backgroundImage", backgroundFile);

      const [res, memberRes] = await Promise.all([
        fetch(`/api/artists/${artist.id}/theme`, { method: "PATCH", body: formData }),
        fetch(`/api/artists/${artist.id}/members/me`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: memberDisplayName, roleLabel: memberRoleLabel }),
        }),
      ]);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장에 실패했어요.");
        return;
      }
      if (!memberRes.ok) {
        setError("활동명/포지션 저장에 실패했어요.");
        return;
      }

      setTheme(data.theme);
      setBannerFile(null);
      setBannerPreview(null);
      setProfileFile(null);
      setProfilePreview(null);
      setBackgroundFile(null);
      setBackgroundPreview(null);
      setSavedNotice(true);
      router.refresh();
    } catch {
      setError("저장 중 오류가 발생했어요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-7xl">
      <p className="text-sm font-semibold text-accent-strong">🎨 페이지 꾸미기</p>
      <h1 className="mt-1 text-2xl font-black text-ink">{artist.name}의 아티스트 페이지 커스터마이즈</h1>
      <p className="mt-2 text-sm text-muted">
        정해진 항목만 바꿀 수 있어요. 왼쪽에서 값을 바꾸면 오른쪽 미리보기에 바로 반영돼요.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className="rounded-full border border-line px-4 py-2 text-xs font-bold text-ink transition hover:border-accent/60"
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={resetToDefault}
              className="rounded-full border border-line px-4 py-2 text-xs font-bold text-muted transition hover:border-black/20"
            >
              기본값으로 되돌리기
            </button>
          </div>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <h2 className="text-sm font-bold text-ink">배너 · 프로필 이미지</h2>
            <div>
              <label className="mb-1 block text-sm text-muted">배너 이미지 (권장 2400x800, 10MB 이하)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerFile} className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:transition hover:file:bg-accent-strong" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">프로필 이미지 (정사각형, 2MB 이하)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfileFile} className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:transition hover:file:bg-accent-strong" />
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <h2 className="text-sm font-bold text-ink">테마 모드 · 글꼴 · 레이아웃</h2>
            <div className="flex gap-2">
              {(["light", "dark"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTheme((t) => ({ ...t, mode: m }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition ${theme.mode === m ? "border-accent bg-accent/10 text-accent-strong" : "border-line text-ink"}`}
                >
                  {m === "light" ? "☀️ 라이트" : "🌙 다크"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTheme((t) => ({ ...t, font: f.id }))}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-bold transition ${theme.font === f.id ? "border-accent bg-accent/10 text-accent-strong" : "border-line text-ink"} ${artistFontClassName(f.id)}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["grid", "list"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setTheme((t) => ({ ...t, discographyLayout: l }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition ${theme.discographyLayout === l ? "border-accent bg-accent/10 text-accent-strong" : "border-line text-ink"}`}
                >
                  {l === "grid" ? "▦ 그리드" : "☰ 리스트"}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <h2 className="text-sm font-bold text-ink">색상</h2>
            <ColorField label="포인트 (accent)" value={theme.colors.accent} onChange={(v) => updateColor("accent", v)} />
            <ColorField label="텍스트" value={theme.colors.text} onChange={(v) => updateColor("text", v)} />
            <ColorField label="링크" value={theme.colors.link} onChange={(v) => updateColor("link", v)} />
            <ColorField label="카드 배경" value={theme.colors.card} onChange={(v) => updateColor("card", v)} />
            {lowContrast && (
              <p className="rounded-lg bg-amber-400/10 p-2 text-xs font-semibold text-amber-700" role="alert">
                ⚠️ 현재 배경/텍스트 대비가 {contrastValue.toFixed(1)}:1이에요 (권장 4.5:1 이상). 방문자에게는 자동으로 보정된 텍스트 색이 표시돼요.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <h2 className="text-sm font-bold text-ink">배경</h2>
            <div className="flex gap-2">
              {(["solid", "gradient", "image"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme((s) => ({ ...s, background: { ...s.background, type: t } }))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${theme.background.type === t ? "border-accent bg-accent/10 text-accent-strong" : "border-line text-ink"}`}
                >
                  {t === "solid" ? "단색" : t === "gradient" ? "그라데이션" : "이미지"}
                </button>
              ))}
            </div>

            <ColorField
              label={theme.background.type === "gradient" ? "배경색 (시작)" : "배경색"}
              value={theme.colors.background}
              onChange={(v) => updateColor("background", v)}
            />

            {theme.background.type === "gradient" && (
              <>
                <ColorField
                  label="배경색 (끝)"
                  value={theme.background.gradientTo ?? "#000000"}
                  onChange={(v) => setTheme((s) => ({ ...s, background: { ...s.background, gradientTo: v } }))}
                />
                <div>
                  <label className="mb-1 block text-sm text-muted">방향</label>
                  <div className="flex gap-2">
                    {GRADIENT_ANGLES.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setTheme((s) => ({ ...s, background: { ...s.background, gradientAngle: a.id } }))}
                        className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition ${theme.background.gradientAngle === a.id ? "border-accent bg-accent/10 text-accent-strong" : "border-line text-ink"}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {theme.background.type === "image" && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-muted">배경 이미지 (5MB 이하)</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBackgroundFile} className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:transition hover:file:bg-accent-strong" />
                  {!backgroundFile && !theme.background.imageUrl && (
                    <p className="mt-1 text-xs text-muted">이미지를 올려야 배경으로 적용돼요.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {(["cover", "tile"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTheme((s) => ({ ...s, background: { ...s.background, tileMode: m } }))}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${theme.background.tileMode === m ? "border-accent bg-accent/10 text-accent-strong" : "border-line text-ink"}`}
                    >
                      {m === "cover" ? "화면 채우기" : "타일"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(["scroll", "fixed"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTheme((s) => ({ ...s, background: { ...s.background, attachment: m } }))}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${theme.background.attachment === m ? "border-accent bg-accent/10 text-accent-strong" : "border-line text-ink"}`}
                    >
                      {m === "fixed" ? "스크롤 시 고정" : "함께 스크롤"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <h2 className="text-sm font-bold text-ink">소개글</h2>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value.slice(0, MAX_BIO_LENGTH))}
              rows={5}
              className={FIELD_CLASS}
            />
            <p className="text-right text-xs text-muted">
              {introduction.length} / {MAX_BIO_LENGTH}
            </p>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <h2 className="text-sm font-bold text-ink">피드 작성자 표시</h2>
            <p className="text-xs text-muted">
              피드에 글을 쓰면 여기서 정한 이름·포지션으로 표시돼요. 비워두면 아티스트명으로 보여요.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={memberDisplayName}
                onChange={(e) => setMemberDisplayName(e.target.value.slice(0, 30))}
                placeholder="활동명 (예: 보컬 OO)"
                className={FIELD_CLASS}
              />
              <input
                value={memberRoleLabel}
                onChange={(e) => setMemberRoleLabel(e.target.value.slice(0, 30))}
                placeholder="포지션 (예: 보컬)"
                className={FIELD_CLASS}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-ink">멤버십 노출</h2>
                <p className="mt-1 text-xs text-muted">
                  켜면 페이지 하단에 구독 카드가 표시돼요. 기본은 꺼짐이에요.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={membershipEnabled}
                onClick={() => setMembershipEnabled((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${membershipEnabled ? "bg-accent" : "bg-line"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${membershipEnabled ? "left-5" : "left-0.5"}`}
                />
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">링크 (최대 {MAX_LINKS}개)</h2>
              {theme.links.length < MAX_LINKS && (
                <button type="button" onClick={addLink} className="text-xs font-bold text-accent-strong">
                  + 링크 추가
                </button>
              )}
            </div>
            {theme.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value.slice(0, MAX_LINK_LABEL_LENGTH) })}
                  placeholder="이름 (예: 인스타그램)"
                  className={`${FIELD_CLASS} w-28 shrink-0`}
                />
                <input
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                  placeholder="https://..."
                  className={FIELD_CLASS}
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  aria-label="링크 삭제"
                  className="shrink-0 rounded-full border border-line px-2 py-1 text-xs text-muted transition hover:border-rose-400 hover:text-rose-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </section>

          {error && (
            <p className="text-sm font-semibold text-rose-600" role="alert">
              {error}
            </p>
          )}
          {savedNotice && !error && (
            <p className="text-sm font-semibold text-emerald-600" role="status">
              저장했어요.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
          >
            {pending ? "저장하는 중..." : "저장하기"}
          </button>
        </form>

        <div className="rounded-2xl border border-line bg-surface p-2">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-xs font-semibold text-muted">실시간 미리보기</p>
            <a
              href={`/artists/${artist.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-accent-strong underline"
            >
              실제 페이지로 보기 ↗
            </a>
          </div>
          <div className="overflow-hidden rounded-xl">
            <ThemedArtistView
              artist={previewArtist}
              theme={previewTheme}
              products={products}
              initialFeed={initialFeed}
              followerCount={followerCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
