"use client";

import { useState } from "react";
import Link from "next/link";
import { artists } from "@/lib/data";
import { GENRES } from "@/lib/genres";
import {
  addTrack,
  computeRightsStatus,
  type RightsDetail,
  type RightsStatus,
  type Track,
} from "@/lib/tracks-storage";
import { RightsForm } from "@/components/rights-form";
import { TrackPreviewPlayer } from "@/components/track-preview-player";

const ME = artists[0];

const STATUS_BADGE: Record<RightsStatus, { emoji: string; label: string }> = {
  clear: { emoji: "🟢", label: "바로 판매 가능" },
  pending_review: { emoji: "🟡", label: "확인이 더 필요해요" },
  trust_registered: { emoji: "🔵", label: "협회 정산 연동 필요" },
};

function defaultRightsDetail(holderName: string): RightsDetail {
  return {
    composition: [{ name: holderName, trustStatus: "none" }],
    performance: [{ name: holderName, trustStatus: "none" }],
    production: { entity: holderName, trustStatus: "none" },
  };
}

export default function TrackUploadPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cameFromSkip, setCameFromSkip] = useState(false);

  // step 1
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState(ME?.name ?? "");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | undefined>(undefined);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [pricingType, setPricingType] = useState<"pwyw" | "fixed">("pwyw");
  const [minPrice, setMinPrice] = useState("0");

  // step 3
  const [rightsDetail, setRightsDetail] = useState<RightsDetail>(() => defaultRightsDetail(ME?.name ?? ""));

  // step 4
  const [consentChecked, setConsentChecked] = useState(false);
  const [submittedTrack, setSubmittedTrack] = useState<Track | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPreviewAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : undefined;
    });
    setAudioFileName(file?.name ?? null);
  };

  const goToStep1Next = () => setStep(2);

  const handleSelfOwned = () => {
    setRightsDetail(defaultRightsDetail(artist || ME?.name || ""));
    setCameFromSkip(true);
    setStep(4);
  };

  const handleNeedsDetail = () => {
    setCameFromSkip(false);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!consentChecked || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await addTrack({
        title,
        artist,
        genre,
        description,
        previewAudioUrl,
        pricingType,
        minPrice: Number(minPrice) || 0,
        previewLimitSeconds: 30,
        rightsDetail,
        consentConfirmedAt: new Date().toISOString(),
      });
      setSubmittedTrack(created);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "업로드에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedTrack) {
    const badge = STATUS_BADGE[submittedTrack.rightsStatus];
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-black text-ink">업로드가 완료됐어요</h1>
        <p className="mt-2 text-muted">“{submittedTrack.title}”이(가) 등록됐어요.</p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-ink">
          <span>{badge.emoji}</span>
          <span>{badge.label}</span>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/my-tracks"
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
          >
            내 트랙 목록 보기
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
            <label className="mb-1 block text-sm text-muted">미리듣기 오디오 (선택, 목업)</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-surface p-4 transition hover:border-accent/50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-lg">
                🎵
              </span>
              <span className="text-sm text-muted">
                {audioFileName ?? "오디오 파일을 선택하세요 (30초까지만 미리듣기 제공)"}
              </span>
              <input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
            </label>
            {previewAudioUrl && (
              <div className="mt-2">
                <TrackPreviewPlayer src={previewAudioUrl} limitSeconds={30} />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">판매 방식</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPricingType("pwyw")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  pricingType === "pwyw"
                    ? "border-accent bg-accent/15 text-accent-strong"
                    : "border-line text-muted hover:border-black/20 hover:text-ink"
                }`}
              >
                자율 가격 (PWYW)
              </button>
              <button
                type="button"
                onClick={() => setPricingType("fixed")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  pricingType === "fixed"
                    ? "border-accent bg-accent/15 text-accent-strong"
                    : "border-line text-muted hover:border-black/20 hover:text-ink"
                }`}
              >
                고정 가격
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={100}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-40 rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              />
              <span className="text-sm text-muted">
                원 {pricingType === "pwyw" ? "(최소 가격)" : "(고정 가격)"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={goToStep1Next}
            disabled={!title || !artist || !genre || !description}
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
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm font-bold text-ink">현재 예상 상태</p>
            {(() => {
              const badge = STATUS_BADGE[computeRightsStatus(rightsDetail)];
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
            미리듣기 오디오는 아직 실제 파일 저장소에 올라가지 않아요 (이 브라우저 탭에서만 재생돼요). 나머지 정보는 실제 DB에 저장됩니다.
          </p>

          {submitError && <p className="text-sm font-semibold text-rose-600">{submitError}</p>}

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
