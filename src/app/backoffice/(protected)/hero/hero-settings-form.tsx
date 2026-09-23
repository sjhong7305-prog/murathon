"use client";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";

const POSITION_OPTIONS = [
  { value: "TOP_LEFT", label: "상단 왼쪽" },
  { value: "TOP_CENTER", label: "상단 중앙" },
  { value: "TOP_RIGHT", label: "상단 오른쪽" },
  { value: "CENTER", label: "정중앙" },
  { value: "BOTTOM_LEFT", label: "하단 왼쪽" },
  { value: "BOTTOM_CENTER", label: "하단 중앙" },
  { value: "BOTTOM_RIGHT", label: "하단 오른쪽" },
];

export function HeroSettingsForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues: { headline: string; subtext: string | null; position: string };
}) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6">
      <div>
        <h2 className="font-bold text-ink">문구 / 위치 설정</h2>
        <p className="mt-1 text-xs text-muted">
          홈 화면 히어로 배너에 표시되는 헤드라인, 서브텍스트와 그 위치를 설정합니다.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">헤드라인</label>
        <input
          name="headline"
          required
          defaultValue={defaultValues.headline}
          className={FIELD_CLASS}
          placeholder="아티스트가 자생하는 건강한 음악 생태계"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">서브텍스트 (선택)</label>
        <input
          name="subtext"
          defaultValue={defaultValues.subtext ?? ""}
          className={FIELD_CLASS}
          placeholder="아직 소문나기 전, 그 아티스트의 다음 이야기를 가장 먼저 만나보세요."
        />
      </div>

      <div className="w-56">
        <label className="mb-1 block text-sm text-muted">문구 위치</label>
        <select name="position" defaultValue={defaultValues.position} className={FIELD_CLASS}>
          {POSITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
      >
        저장
      </button>
    </form>
  );
}
