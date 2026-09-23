"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "@/lib/use-catalog";
import { useAuth } from "@/context/auth-context";
import { LoginRequired } from "@/components/login-required";
import { GENRES } from "@/lib/genres";
import { formatDuration } from "@/lib/format";
import {
  computeRightsStatus,
  createTrackRelease,
  type RightsDetail,
  type Track,
} from "@/lib/tracks-storage";
import { getRightsStatusBadge } from "@/lib/rights-status-badge";
import { StoryPromptFields } from "@/components/story-prompt-fields";
import { RightsForm } from "@/components/rights-form";
import { TrackPreviewPlayer } from "@/components/track-preview-player";

function defaultRightsDetail(holderName: string): RightsDetail {
  return {
    composition: [{ name: holderName, trustStatus: "none" }],
    performance: [{ name: holderName, trustStatus: "none" }],
    production: { entity: holderName, trustStatus: "none" },
  };
}

export default function TrackUploadPage() {
  const catalog = useCatalog();
  const { loading, activeArtistId } = useAuth();
  const me = activeArtistId ? catalog?.getArtistById(activeArtistId) : undefined;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cameFromSkip, setCameFromSkip] = useState(false);

  // step 1
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");

  const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | undefined>(undefined);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [audioPreview, setAudioPreview] = useState<string | undefined>(undefined);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | undefined>(undefined);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number | undefined>(undefined);

  const [minPrice, setMinPrice] = useState("0");
  const [suggestedPrice, setSuggestedPrice] = useState("3000");
  const [storyOrigin, setStoryOrigin] = useState("");
  const [storyStruggle, setStoryStruggle] = useState("");
  const [storyAudience, setStoryAudience] = useState("");

  // step 3
  const [rightsDetail, setRightsDetail] = useState<RightsDetail>(() => defaultRightsDetail(""));

  // step 4
  const [consentChecked, setConsentChecked] = useState(false);
  const [submittedTrack, setSubmittedTrack] = useState<Track | null>(null);
  const [submittedProductId, setSubmittedProductId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!me) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed form defaults once the catalog loads
    setArtist(me.name);
    setRightsDetail(defaultRightsDetail(me.name));
  }, [me]);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : undefined;
    });
    setUploadedCoverUrl(undefined);
    setCoverError(null);
    if (!file || !activeArtistId) return;

    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`/api/artists/${activeArtistId}/tracks/cover`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "커버 이미지 업로드에 실패했어요.");
      setUploadedCoverUrl(data.url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "커버 이미지 업로드에 실패했어요.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    let objectUrl: string | undefined;
    setAudioPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      objectUrl = file ? URL.createObjectURL(file) : undefined;
      return objectUrl;
    });
    setAudioFileName(file?.name ?? null);
    setUploadedAudioUrl(undefined);
    setAudioError(null);
    setDurationSec(undefined);
    if (!file || !activeArtistId) return;

    // No audio-decoding library on the server, so duration is read client-side via the
    // browser's own metadata parsing (same object URL the preview player already uses).
    if (objectUrl) {
      const probe = new Audio(objectUrl);
      probe.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(probe.duration)) setDurationSec(Math.round(probe.duration));
      });
    }

    setAudioUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", file);
      const res = await fetch(`/api/artists/${activeArtistId}/tracks/audio`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "오디오 업로드에 실패했어요.");
      setUploadedAudioUrl(data.url);
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : "오디오 업로드에 실패했어요.");
    } finally {
      setAudioUploading(false);
    }
  };

  const goToStep1Next = () => setStep(2);

  const handleSelfOwned = () => {
    setRightsDetail(defaultRightsDetail(artist || me?.name || ""));
    setCameFromSkip(true);
    setStep(4);
  };

  const handleNeedsDetail = () => {
    setCameFromSkip(false);
    setStep(3);
  };

  const priceValid = Number.isFinite(Number(minPrice)) && Number.isFinite(Number(suggestedPrice)) && Number(suggestedPrice) >= Number(minPrice);

  const handleSubmit = async () => {
    if (!consentChecked || !activeArtistId || !priceValid) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const { track, productId } = await createTrackRelease(activeArtistId, {
        title,
        artist,
        genre,
        description,
        imageUrl: uploadedCoverUrl,
        previewAudioUrl: uploadedAudioUrl,
        durationSec,
        minPrice: Number(minPrice) || 0,
        suggestedPrice: Number(suggestedPrice) || 0,
        rightsDetail,
        storyPrompts: {
          origin: storyOrigin.trim(),
          struggle: storyStruggle.trim(),
          audience: storyAudience.trim(),
        },
        consentConfirmedAt: now,
      });
      setSubmittedTrack(track);
      setSubmittedProductId(productId);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!activeArtistId) return <LoginRequired />;

  if (submittedTrack && submittedProductId) {
    const badge = getRightsStatusBadge(submittedTrack.rightsStatus);
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-black text-ink">업로드가 완료됐어요</h1>
        <p className="mt-2 text-muted">
          “{submittedTrack.title}”이(가) 등록됐어요. 검색과 아티스트 페이지에 바로 노출돼요.
        </p>

        {uploadedCoverUrl && (
          <Image
            src={uploadedCoverUrl}
            alt=""
            width={96}
            height={96}
            className="mx-auto mt-4 h-24 w-24 rounded-xl object-cover"
          />
        )}

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-ink">
          <span>{badge.emoji}</span>
          <span>{badge.label}</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          권리 확인 상태는 “내 트랙” 페이지에서 언제든 다시 편집할 수 있어요.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex justify-center gap-3">
            <Link
              href={`/products/${submittedProductId}`}
              className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
            >
              판매 페이지 보기
            </Link>
            <Link
              href="/my-tracks"
              className="rounded-full border border-line px-6 py-3 text-sm font-bold text-ink hover:border-black/20"
            >
              내 트랙 목록 보기
            </Link>
          </div>
          <Link href={`/tracks/${submittedTrack.id}`} className="text-xs font-semibold text-muted hover:text-ink">
            소개 페이지 보기 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-black text-ink">음원 업로드</h1>
      <p className="mt-1 text-sm text-muted">
        곡 정보를 입력하고, 이 곡의 권리 관계를 가볍게 확인해주세요.
      </p>

      <div className="mt-5 flex items-center gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${
              n <= step ? "bg-accent" : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-semibold text-muted">{step}단계 / 4단계</p>

      {step === 1 && (
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted">트랙 제목</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="예: 잔상"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">아티스트명</label>
            <input
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">장르</label>
            <select
              required
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            >
              <option value="" disabled>
                장르를 선택하세요
              </option>
              {GENRES.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">커버 이미지 (선택)</label>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line bg-surface p-4 transition hover:border-accent/50">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-cream text-2xl">
                  🖼️
                </span>
              )}
              <span className="text-sm text-muted">
                {coverUploading ? "업로드 중..." : "이미지를 선택하세요 (없으면 랜덤 그라디언트로 표시돼요)"}
              </span>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
            {coverError && <p className="mt-1 text-xs font-semibold text-rose-600">{coverError}</p>}
          </div>

          <StoryPromptFields
            origin={storyOrigin}
            struggle={storyStruggle}
            audience={storyAudience}
            onOriginChange={setStoryOrigin}
            onStruggleChange={setStoryStruggle}
            onAudienceChange={setStoryAudience}
          />

          <div>
            <label className="mb-1 block text-sm text-muted">곡 설명</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="이 곡을 짧게 소개해주세요"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">오디오 파일 (선택)</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-surface p-4 transition hover:border-accent/50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-lg">
                🎵
              </span>
              <span className="text-sm text-muted">
                {audioUploading
                  ? "업로드 중..."
                  : audioFileName
                    ? `${audioFileName}${durationSec !== undefined ? ` · ${formatDuration(durationSec)}` : ""}`
                    : "오디오 파일을 선택하세요 (구매 전에는 30초까지만 미리듣기 제공)"}
              </span>
              <input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
            </label>
            {audioError && <p className="mt-1 text-xs font-semibold text-rose-600">{audioError}</p>}
            {audioPreview && (
              <div className="mt-2">
                <TrackPreviewPlayer src={audioPreview} limitSeconds={30} />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">가격</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
                />
                <p className="mt-1 text-xs text-muted">최소 가격 · 0원이면 완전 자율 가격이에요</p>
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
                />
                <p className="mt-1 text-xs text-muted">권장 가격 · 체크아웃에 기본으로 보여줘요</p>
              </div>
            </div>
            {!priceValid && (
              <p className="mt-1 text-xs font-semibold text-rose-600">권장 가격은 최소 가격 이상이어야 해요.</p>
            )}
          </div>

          <button
            type="button"
            onClick={goToStep1Next}
            disabled={!title || !artist || !genre || !description || !priceValid || coverUploading || audioUploading}
            className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-10 flex flex-col items-center gap-6 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="text-lg font-bold text-ink">
            이 곡, 전부 직접 만들었고 어디에도 등록 안 했어요?
          </p>
          <p className="text-sm text-muted">
            작사·작곡, 노래·연주, 녹음까지 전부 본인이 했고, 협회 같은 곳에 등록한 적이 없다면 “네”를 눌러주세요.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSelfOwned}
              className="flex-1 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              네, 맞아요
            </button>
            <button
              type="button"
              onClick={handleNeedsDetail}
              className="flex-1 rounded-full border border-line px-6 py-3.5 text-sm font-bold text-ink transition hover:border-black/20"
            >
              아니요, 상황이 달라요
            </button>
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs font-semibold text-muted hover:text-ink"
          >
            ← 이전으로
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 flex flex-col gap-4">
          <RightsForm value={rightsDetail} onChange={setRightsDetail} />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition hover:border-black/20"
            >
              ← 이전
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6 flex flex-col gap-5">
          <div className="rounded-xl border border-line bg-surface p-4 text-sm">
            <p className="font-bold text-ink">첨부 파일 확인</p>
            <p className="mt-1.5 text-ink">
              커버 이미지: {uploadedCoverUrl ? "✅ 업로드됨" : "— 없음 (랜덤 그라디언트로 표시돼요)"}
            </p>
            <p className="mt-1 text-ink">
              오디오: {uploadedAudioUrl ? "✅ 업로드됨" : "— 없음"}
            </p>
            {audioFileName && !uploadedAudioUrl && (
              <p className="mt-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-800">
                “{audioFileName}” 파일을 선택하셨지만 업로드가 완료되지 않았어요. 이대로 제출하면 오디오 없이 등록돼요 — 1단계로 돌아가서 다시 올려주세요.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm font-bold text-ink">현재 예상 상태</p>
            {(() => {
              const badge = getRightsStatusBadge(computeRightsStatus(rightsDetail));
              return (
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink">
                  <span>{badge.emoji}</span>
                  <span>{badge.label}</span>
                </p>
              );
            })()}
            <p className="mt-1 text-xs text-muted">
              제출 후에도 상태가 궁금한 부분이 있다면 “내 트랙” 페이지에서 언제든 다시 편집할 수 있어요.
            </p>
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-line bg-surface p-4 text-sm text-ink">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-accent"
            />
            <span>위 내용이 사실과 다를 경우 발생하는 책임은 본인에게 있음을 확인합니다.</span>
          </label>

          <p className="text-xs text-muted">
            제출하면 실제로 검색·캐탈로그·아티스트 페이지에 노출되는 판매 상품이 등록돼요.
          </p>

          {submitError && (
            <p className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-700">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(cameFromSkip ? 2 : 3)}
              className="rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition hover:border-black/20"
            >
              ← 이전
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!consentChecked || submitting}
              className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "제출 중..." : "제출하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
