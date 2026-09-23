interface ArtistFormValues {
  slug?: string;
  name?: string;
  genre?: string;
  genreTags?: string[];
  location?: string;
  tagline?: string;
  introduction?: string;
  coverColor?: string;
  imageUrl?: string | null;
  bannerImage?: string | null;
  snsLink?: string | null;
  youtubeLink?: string | null;
  websiteLink?: string | null;
  checkoutQuestion?: string | null;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";

export function ArtistForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: ArtistFormValues;
  submitLabel: string;
}) {
  const v = defaultValues ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">슬러그 (URL)</label>
          <input name="slug" required defaultValue={v.slug} className={FIELD_CLASS} placeholder="wonder-static" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">이름</label>
          <input name="name" required defaultValue={v.name} className={FIELD_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">장르</label>
          <input name="genre" required defaultValue={v.genre} className={FIELD_CLASS} placeholder="드림팝 / 슈게이징" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">장르 태그 (쉼표로 구분)</label>
          <input
            name="genreTags"
            defaultValue={v.genreTags?.join(", ")}
            className={FIELD_CLASS}
            placeholder="alternative, rock"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">지역</label>
          <input name="location" required defaultValue={v.location} className={FIELD_CLASS} />
        </div>
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
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">태그라인</label>
        <input name="tagline" required defaultValue={v.tagline} className={FIELD_CLASS} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">소개</label>
        <textarea name="introduction" required defaultValue={v.introduction} rows={4} className={FIELD_CLASS} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">프로필 이미지 URL</label>
          <input name="imageUrl" defaultValue={v.imageUrl ?? ""} className={FIELD_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">배너 이미지 URL</label>
          <input name="bannerImage" defaultValue={v.bannerImage ?? ""} className={FIELD_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">SNS 링크</label>
          <input name="snsLink" defaultValue={v.snsLink ?? ""} className={FIELD_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">YouTube 링크</label>
          <input name="youtubeLink" defaultValue={v.youtubeLink ?? ""} className={FIELD_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">웹사이트 링크</label>
          <input name="websiteLink" defaultValue={v.websiteLink ?? ""} className={FIELD_CLASS} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">체크아웃 질문</label>
          <input name="checkoutQuestion" defaultValue={v.checkoutQuestion ?? ""} className={FIELD_CLASS} />
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
