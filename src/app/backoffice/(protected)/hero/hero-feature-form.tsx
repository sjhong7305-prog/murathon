"use client";

import { useState, type ChangeEvent } from "react";

interface Artist {
  id: string;
  name: string;
}

interface HeroFeatureFormValues {
  artistId?: string;
  customName?: string;
  customSubtitle?: string;
  label?: string;
  imageUrl?: string;
  sortOrder?: number;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";

const LABEL_OPTIONS = [
  { value: "BEST_OF_WEEK", label: "이번주 베스트" },
  { value: "TRENDING", label: "요즘 뜨는" },
];

export function HeroFeatureForm({
  action,
  artists,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  artists: Artist[];
  defaultValues?: HeroFeatureFormValues;
  submitLabel: string;
}) {
  const v = defaultValues ?? {};
  const [preview, setPreview] = useState<string | null>(v.imageUrl ?? null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form action={action} encType="multipart/form-data" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">아티스트 (등록된 아티스트에서 선택)</label>
          <select name="artistId" defaultValue={v.artistId ?? ""} className={FIELD_CLASS}>
            <option value="">선택 안 함 — 아래에 직접 입력</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">라벨</label>
          <select name="label" required defaultValue={v.label ?? "BEST_OF_WEEK"} className={FIELD_CLASS}>
            {LABEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">표시 이름 직접 입력 (선택)</label>
          <input
            name="customName"
            defaultValue={v.customName ?? ""}
            className={FIELD_CLASS}
            placeholder="예: 새벽 라디오 (게스트 아티스트)"
          />
          <p className="mt-1 text-xs text-muted">
            비워두면 위에서 선택한 아티스트 이름이 표시됩니다. 등록되지 않은 아티스트를 홍보하고 싶을 때 여기에 이름을 직접 입력하세요.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">부제 / 앨범명 (선택)</label>
          <input
            name="customSubtitle"
            defaultValue={v.customSubtitle ?? ""}
            className={FIELD_CLASS}
            placeholder="예: 정규 2집 《여름의 끝》"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">히어로 이미지</label>

        {preview && (
          // 관리자가 붙여넣는 URL은 next.config의 remotePatterns에 없는 외부 호스트일 수 있어
          // next/image가 아닌 일반 img로 미리보기를 그려야 어떤 URL이든 깨지지 않는다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="mb-2 h-36 w-full max-w-md rounded-lg border border-line object-cover"
          />
        )}

        <input
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:transition hover:file:bg-accent-strong"
        />
        <p className="mt-2 text-xs text-muted">
          내 컴퓨터의 이미지를 업로드하거나, 아래에 외부 이미지 URL을 입력하세요. 파일을 선택하면 URL 값은 무시됩니다.
        </p>
        <input
          name="imageUrl"
          defaultValue={v.imageUrl ?? ""}
          className={`${FIELD_CLASS} mt-2`}
          placeholder="https://..."
        />
      </div>

      <div className="w-40">
        <label className="mb-1 block text-sm text-muted">정렬 순서</label>
        <input
          name="sortOrder"
          type="number"
          step={1}
          defaultValue={v.sortOrder ?? 0}
          className={FIELD_CLASS}
        />
        <p className="mt-1 text-xs text-muted">숫자가 작을수록 먼저 노출됩니다.</p>
      </div>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
      >
        {submitLabel}
      </button>
    </form>
  );
}
