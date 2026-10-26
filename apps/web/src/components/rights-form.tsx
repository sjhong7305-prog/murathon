"use client";

import type {
  CompositionRightsHolder,
  CompositionTrustStatus,
  PerformanceRightsHolder,
  PerformanceTrustStatus,
  ProductionTrustStatus,
  RightsDetail,
} from "@/lib/tracks-storage";

const COMPOSITION_OPTIONS: { value: CompositionTrustStatus; label: string }[] = [
  { value: "komca", label: "한국음악저작권협회(KOMCA) 등록" },
  { value: "koscap", label: "함께하는음악저작인협회 등록" },
  { value: "none", label: "등록 안 함" },
  { value: "unknown", label: "모름" },
];

const PERFORMANCE_OPTIONS: { value: PerformanceTrustStatus; label: string }[] = [
  { value: "fkmp", label: "한국음악실연자연합회 등록" },
  { value: "none", label: "등록 안 함" },
  { value: "unknown", label: "모름" },
];

const PRODUCTION_OPTIONS: { value: ProductionTrustStatus; label: string }[] = [
  { value: "riak", label: "한국음반산업협회(RIAK) 등록" },
  { value: "none", label: "등록 안 함" },
  { value: "unknown", label: "모름" },
];

function TrustStatusPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            value === opt.value
              ? "border-accent bg-accent/15 text-accent-strong"
              : "border-line text-muted hover:border-black/20 hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function RightsForm({
  value,
  onChange,
}: {
  value: RightsDetail;
  onChange: (detail: RightsDetail) => void;
}) {
  const updateComposition = (index: number, patch: Partial<CompositionRightsHolder>) => {
    onChange({
      ...value,
      composition: value.composition.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    });
  };

  const addComposition = () => {
    onChange({
      ...value,
      composition: [...value.composition, { name: "", trustStatus: "none" }],
    });
  };

  const removeComposition = (index: number) => {
    onChange({ ...value, composition: value.composition.filter((_, i) => i !== index) });
  };

  const updatePerformance = (index: number, patch: Partial<PerformanceRightsHolder>) => {
    onChange({
      ...value,
      performance: value.performance.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    });
  };

  const addPerformance = () => {
    onChange({
      ...value,
      performance: [...value.performance, { name: "", trustStatus: "none" }],
    });
  };

  const removePerformance = (index: number) => {
    onChange({ ...value, performance: value.performance.filter((_, i) => i !== index) });
  };

  const updateProduction = (patch: Partial<RightsDetail["production"]>) => {
    onChange({ ...value, production: { ...value.production, ...patch } });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* (1) 작사·작곡·편곡 */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="font-bold text-ink">작사·작곡·편곡</p>
        <p className="mt-0.5 text-xs text-muted">
          이 곡을 쓰고 만든 사람들을 추가해주세요. 여러 명이 함께 만들었다면 모두 적어주세요.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {value.composition.map((c, i) => (
            <div key={i} className="rounded-lg border border-line p-3">
              <div className="flex items-center gap-2">
                <input
                  value={c.name}
                  onChange={(e) => updateComposition(i, { name: e.target.value })}
                  placeholder="이름"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
                {value.composition.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeComposition(i)}
                    className="shrink-0 rounded-lg border border-line px-2.5 py-2 text-xs font-semibold text-muted transition hover:border-rose-400/50 hover:text-rose-600"
                  >
                    삭제
                  </button>
                )}
              </div>

              <p className="mt-3 mb-1 text-xs font-semibold text-muted">협회 등록 여부</p>
              <TrustStatusPicker
                options={COMPOSITION_OPTIONS}
                value={c.trustStatus}
                onChange={(v) => updateComposition(i, { trustStatus: v })}
              />

              {(c.trustStatus === "komca" || c.trustStatus === "koscap") && (
                <input
                  value={c.memberCode ?? ""}
                  onChange={(e) => updateComposition(i, { memberCode: e.target.value })}
                  placeholder="회원코드 (선택)"
                  className="mt-2 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addComposition}
            className="self-start rounded-full border border-line px-4 py-2 text-xs font-bold text-ink transition hover:border-accent/50 hover:text-accent-strong"
          >
            + 공동창작자 추가
          </button>
        </div>
      </div>

      {/* (2) 노래·연주 */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="font-bold text-ink">노래·연주</p>
        <p className="mt-0.5 text-xs text-muted">
          이 곡을 직접 노래하거나 연주한 사람들을 추가해주세요.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {value.performance.map((p, i) => (
            <div key={i} className="rounded-lg border border-line p-3">
              <div className="flex items-center gap-2">
                <input
                  value={p.name}
                  onChange={(e) => updatePerformance(i, { name: e.target.value })}
                  placeholder="이름"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
                {value.performance.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePerformance(i)}
                    className="shrink-0 rounded-lg border border-line px-2.5 py-2 text-xs font-semibold text-muted transition hover:border-rose-400/50 hover:text-rose-600"
                  >
                    삭제
                  </button>
                )}
              </div>

              <p className="mt-3 mb-1 text-xs font-semibold text-muted">협회 등록 여부</p>
              <TrustStatusPicker
                options={PERFORMANCE_OPTIONS}
                value={p.trustStatus}
                onChange={(v) => updatePerformance(i, { trustStatus: v })}
              />

              {p.trustStatus === "fkmp" && (
                <input
                  value={p.memberCode ?? ""}
                  onChange={(e) => updatePerformance(i, { memberCode: e.target.value })}
                  placeholder="회원코드 (선택)"
                  className="mt-2 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addPerformance}
            className="self-start rounded-full border border-line px-4 py-2 text-xs font-bold text-ink transition hover:border-accent/50 hover:text-accent-strong"
          >
            + 연주자 추가
          </button>
        </div>
      </div>

      {/* (3) 음반 제작 */}
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="font-bold text-ink">음반 제작</p>
        <p className="mt-0.5 text-xs text-muted">이 음원을 녹음하고 완성한 주체를 적어주세요.</p>

        <div className="mt-4 rounded-lg border border-line p-3">
          <input
            value={value.production.entity}
            onChange={(e) => updateProduction({ entity: e.target.value })}
            placeholder="본인/팀 이름 또는 외부 제작사명"
            className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />

          <p className="mt-3 mb-1 text-xs font-semibold text-muted">협회 등록 여부</p>
          <TrustStatusPicker
            options={PRODUCTION_OPTIONS}
            value={value.production.trustStatus}
            onChange={(v) => updateProduction({ trustStatus: v })}
          />

          {value.production.trustStatus === "riak" && (
            <input
              value={value.production.memberCode ?? ""}
              onChange={(e) => updateProduction({ memberCode: e.target.value })}
              placeholder="회원코드 (선택)"
              className="mt-2 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          )}
        </div>
      </div>
    </div>
  );
}
