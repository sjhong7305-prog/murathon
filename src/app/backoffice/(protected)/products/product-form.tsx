import { RELEASE_TYPE_OPTIONS } from "@/lib/release-label";

interface Artist {
  id: string;
  name: string;
}

interface AlbumOption {
  id: string;
  title: string;
  artistName: string;
}

interface ProductFormValues {
  artistId?: string;
  type?: string;
  title?: string;
  description?: string;
  format?: string | null;
  releaseType?: string | null;
  minPrice?: number;
  suggestedPrice?: number;
  coverColor?: string;
  imageUrl?: string | null;
  previewAudioUrl?: string | null;
  secretTitle?: string | null;
  secretMessage?: string | null;
  eventName?: string | null;
  venue?: string | null;
  eventAt?: string | null;
  includedAlbumId?: string | null;
  longDescription?: string | null;
  releaseDate?: string | null;
  credits?: string | null;
  durationSec?: number | null;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";

const TYPE_OPTIONS = [
  { value: "ALBUM", label: "앨범" },
  { value: "TRACK", label: "트랙" },
  { value: "MERCH", label: "굿즈" },
  { value: "TICKET", label: "티켓" },
];

export function ProductForm({
  action,
  artists,
  albums,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  artists: Artist[];
  albums: AlbumOption[];
  defaultValues?: ProductFormValues;
  submitLabel: string;
}) {
  const v = defaultValues ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">아티스트</label>
          <select name="artistId" required defaultValue={v.artistId} className={FIELD_CLASS}>
            <option value="" disabled>
              선택하세요
            </option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">종류</label>
          <select name="type" required defaultValue={v.type ?? "ALBUM"} className={FIELD_CLASS}>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">제목</label>
        <input name="title" required defaultValue={v.title} className={FIELD_CLASS} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">설명</label>
        <textarea name="description" required defaultValue={v.description} rows={3} className={FIELD_CLASS} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">형식 (굿즈/티켓 전용)</label>
          <input name="format" defaultValue={v.format ?? ""} className={FIELD_CLASS} placeholder="의류 / M~XL" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">최소 가격</label>
          <input
            name="minPrice"
            type="number"
            min={0}
            step={100}
            defaultValue={v.minPrice ?? 0}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">권장 가격</label>
          <input
            name="suggestedPrice"
            type="number"
            min={0}
            step={100}
            defaultValue={v.suggestedPrice ?? 0}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">커버 그라디언트 클래스</label>
          <input
            name="coverColor"
            required
            defaultValue={v.coverColor}
            className={FIELD_CLASS}
            placeholder="from-violet-500 to-fuchsia-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">이미지 URL</label>
          <input name="imageUrl" defaultValue={v.imageUrl ?? ""} className={FIELD_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">미리듣기 오디오 URL</label>
          <input name="previewAudioUrl" defaultValue={v.previewAudioUrl ?? ""} className={FIELD_CLASS} />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-3">
        <p className="mb-2 text-sm font-bold text-ink">🎫 티켓 전용 (종류가 티켓일 때만 사용)</p>
        <div className="grid grid-cols-3 gap-2">
          <input
            name="eventName"
            defaultValue={v.eventName ?? ""}
            className={FIELD_CLASS}
            placeholder="공연명"
          />
          <input name="venue" defaultValue={v.venue ?? ""} className={FIELD_CLASS} placeholder="장소" />
          <input
            name="eventAt"
            type="datetime-local"
            defaultValue={v.eventAt ? v.eventAt.slice(0, 16) : ""}
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-3">
        <p className="mb-2 text-sm font-bold text-ink">🎁 굿즈+음원 번들 (종류가 굿즈일 때만 사용)</p>
        <select name="includedAlbumId" defaultValue={v.includedAlbumId ?? ""} className={FIELD_CLASS}>
          <option value="">포함된 음원 없음</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.artistName} - {a.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-line bg-surface p-3">
        <p className="mb-2 text-sm font-bold text-ink">🎵 음원 전용 (종류가 앨범/트랙일 때만 사용)</p>
        <div className="flex flex-col gap-2">
          <div>
            <label className="mb-1 block text-sm text-muted">릴리즈 유형</label>
            <select name="releaseType" defaultValue={v.releaseType ?? "single"} className={FIELD_CLASS}>
              {RELEASE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="longDescription"
            defaultValue={v.longDescription ?? ""}
            rows={5}
            maxLength={2000}
            className={FIELD_CLASS}
            placeholder="앨범 소개 (최대 2000자, 줄바꿈 유지됨)"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              name="releaseDate"
              type="date"
              defaultValue={v.releaseDate ? v.releaseDate.slice(0, 10) : ""}
              className={FIELD_CLASS}
            />
            <input name="credits" defaultValue={v.credits ?? ""} className={FIELD_CLASS} placeholder="크레딧 (선택)" />
            <input
              name="durationSec"
              type="number"
              min={0}
              defaultValue={v.durationSec ?? ""}
              className={FIELD_CLASS}
              placeholder="트랙 상품 재생시간(초)"
            />
          </div>
          <p className="text-xs text-muted">
            앨범이면 재생시간은 수록곡 목록(트랙 관리)에서 합산돼요. 이 재생시간 입력란은 싱글(트랙) 상품 전용이에요.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-3">
        <p className="mb-2 text-sm font-bold text-ink">🔓 시크릿 콘텐츠 (선택)</p>
        <div className="flex flex-col gap-2">
          <input
            name="secretTitle"
            defaultValue={v.secretTitle ?? ""}
            className={FIELD_CLASS}
            placeholder="제목"
          />
          <textarea
            name="secretMessage"
            defaultValue={v.secretMessage ?? ""}
            rows={2}
            className={FIELD_CLASS}
            placeholder="구매자에게만 보여줄 메시지"
          />
        </div>
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
