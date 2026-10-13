"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { artistNewAction, type ArtistNewActionState } from "./actions";
import { suggestAddress } from "@/lib/romanize";

const initialState: ArtistNewActionState = {};

const ADDRESS_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AddressStatus = "idle" | "checking" | "available" | "taken" | "invalid";
type CheckResult = "checking" | "available" | "taken" | null;

const LABEL_CLASS = "mb-1 block text-sm font-semibold text-ink";
const HELPER_CLASS = "mt-1 text-xs font-normal text-muted";
const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";
const BLACK_BUTTON_CLASS =
  "rounded-full bg-black font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500";

export function ArtistNewForm() {
  const [state, formAction, pending] = useActionState(artistNewAction, initialState);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [addressTouched, setAddressTouched] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult>(null);
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!addressTouched) setAddress(suggestAddress(value));
  };

  // "idle"/"invalid" are pure functions of `address` and need no effect; only the
  // actual network check (below) is asynchronous state worth holding separately.
  const isWellFormed = address.length > 0 && ADDRESS_PATTERN.test(address);

  useEffect(() => {
    if (!isWellFormed) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setCheckResult("checking");
      fetch(`/api/artists/slug-check?slug=${encodeURIComponent(address)}`)
        .then((res) => res.json())
        .then((data: { available: boolean }) => {
          if (!cancelled) setCheckResult(data.available ? "available" : "taken");
        })
        .catch(() => {
          if (!cancelled) setCheckResult(null);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address, isWellFormed]);

  const addressStatus: AddressStatus = !address
    ? "idle"
    : !isWellFormed
      ? "invalid"
      : (checkResult ?? "checking");

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      setImagePreview(null);
      setImageError(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("jpg, png, webp 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("5MB 이하 파일만 업로드할 수 있어요.");
      return;
    }
    setImageError(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("jpg, png, webp 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("5MB 이하 파일만 업로드할 수 있어요.");
      return;
    }

    // Sync the dropped file onto the hidden <input type="file"> so the form's
    // own FormData picks it up on submit, same as a manually picked file.
    if (fileInputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInputRef.current.files = transfer.files;
    }
    setImageError(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    validateAndSetFile(null);
  };

  const addressHelper =
    addressStatus === "checking"
      ? { text: "확인 중…", className: "text-muted" }
      : addressStatus === "available"
        ? { text: "사용 가능한 주소예요", className: "text-emerald-600" }
        : addressStatus === "taken"
          ? { text: "이미 사용 중인 주소예요", className: "text-rose-600" }
          : null;

  const canSubmit = addressStatus === "available" && !imageError && !pending;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold text-accent-strong">🎸 아티스트 페이지 만들기</p>
      <h1 className="mt-1 text-2xl font-black text-ink">
        활동명과 페이지 주소만 정하면 바로 시작해요
      </h1>
      <p className="mt-2 text-sm text-muted">
        소개, 장르, 이미지는 나중에 언제든 채울 수 있어요. 정산 정보는 실제 공개/출금 시점에 받아요.
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <form
          action={formAction}
          encType="multipart/form-data"
          className="flex w-full flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:max-w-[560px] sm:p-8"
        >
          <div>
            <label className={LABEL_CLASS}>활동명</label>
            <input
              required
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={FIELD_CLASS}
              placeholder="뮤라톤"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>페이지 주소</label>
            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 focus-within:border-accent">
              <span className="shrink-0 text-sm text-muted">murathon.com/artists/</span>
              <input
                required
                name="address"
                value={address}
                onChange={(e) => {
                  setAddressTouched(true);
                  setAddress(e.target.value.toLowerCase());
                }}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                className="min-w-0 flex-1 bg-transparent text-ink outline-none"
                placeholder="muraton"
              />
            </div>
            {addressHelper && (
              <p className={`mt-1 text-xs font-semibold ${addressHelper.className}`}>
                {addressHelper.text}
              </p>
            )}
            <p className={HELPER_CLASS}>영문 소문자, 숫자, 하이픈(-)을 쓸 수 있어요.</p>
          </div>

          <div>
            <label className={LABEL_CLASS}>소개 (선택)</label>
            <textarea
              name="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={FIELD_CLASS}
              placeholder="어떤 음악을 하는 아티스트인가요?"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>장르 (선택)</label>
            <input
              name="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={FIELD_CLASS}
              placeholder="예: 힙합 / 솔로, 밴드, 재즈 등"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>프로필 이미지 (선택)</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition ${
                isDraggingOver ? "border-ink bg-black/5" : "border-line"
              }`}
            >
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-24 w-24 rounded-full border border-line object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="이미지 삭제"
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white transition hover:bg-neutral-800"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-line bg-cream text-xs text-muted">
                  미리보기
                </div>
              )}
              <p className="text-xs text-muted">이미지를 끌어다 놓거나</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`${BLACK_BUTTON_CLASS} px-4 py-1.5 text-xs`}
              >
                파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="imageFile"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="sr-only"
              />
            </div>
            {imageError && (
              <p className="mt-1 text-xs font-semibold text-rose-600" role="alert">
                {imageError}
              </p>
            )}
            <p className={HELPER_CLASS}>jpg, png, webp · 5MB 이하</p>
          </div>

          {state?.error && (
            <p className="text-sm font-semibold text-rose-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`${BLACK_BUTTON_CLASS} mt-2 px-6 py-3 text-sm`}
          >
            {pending ? "만드는 중..." : "아티스트 페이지 만들기"}
          </button>
        </form>

        <aside className="w-full sm:max-w-[320px] lg:flex-1">
          <p className="mb-2 text-xs font-semibold text-muted">미리보기</p>
          <div className="rounded-2xl border border-line bg-surface p-6 text-center">
            <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-line bg-cream">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-black text-muted">
                  {name.trim() ? name.trim()[0] : "?"}
                </div>
              )}
            </div>
            <p className="mt-3 text-base font-black text-ink">{name.trim() || "활동명을 입력해주세요"}</p>
            <p className="mt-1 text-sm text-muted">{genre.trim() || "장르 미설정"}</p>
            <p className="mt-3 text-sm text-ink/80">{bio.trim() || "아직 소개글이 없어요."}</p>
            {address && <p className="mt-4 text-xs text-muted">murathon.com/artists/{address}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
