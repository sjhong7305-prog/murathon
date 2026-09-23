"use client";

import { useState } from "react";

export interface TrackRowValue {
  trackNumber: number;
  title: string;
  durationSec: number;
  previewUrl?: string | null;
  isTitle: boolean;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-accent";

export function TrackRowsEditor({ initialTracks }: { initialTracks: TrackRowValue[] }) {
  const [rows, setRows] = useState<TrackRowValue[]>(
    initialTracks.length > 0
      ? initialTracks
      : [{ trackNumber: 1, title: "", durationSec: 180, previewUrl: "", isTitle: false }]
  );

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { trackNumber: prev.length + 1, title: "", durationSec: 180, previewUrl: "", isTitle: false },
    ]);

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="rowCount" value={rows.length} />
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[48px_1fr_72px_1fr_auto_auto] items-center gap-2 rounded-lg border border-line p-2"
        >
          <input
            name={`trackNumber_${idx}`}
            type="number"
            min={1}
            defaultValue={row.trackNumber}
            className={FIELD_CLASS}
          />
          <input name={`title_${idx}`} required defaultValue={row.title} placeholder="곡명" className={FIELD_CLASS} />
          <input
            name={`durationSec_${idx}`}
            type="number"
            min={0}
            defaultValue={row.durationSec}
            title="재생시간(초)"
            className={FIELD_CLASS}
          />
          <input
            name={`previewUrl_${idx}`}
            defaultValue={row.previewUrl ?? ""}
            placeholder="미리듣기 URL (선택, 없으면 상품 오디오로 대체)"
            className={FIELD_CLASS}
          />
          <label className="flex items-center gap-1 whitespace-nowrap text-xs text-ink">
            <input type="checkbox" name={`isTitle_${idx}`} defaultChecked={row.isTitle} className="h-4 w-4 accent-accent" />
            TITLE
          </label>
          <button
            type="button"
            onClick={() => removeRow(idx)}
            className="rounded-lg border border-line px-2 py-1 text-xs font-bold text-muted hover:border-rose-400/50 hover:text-rose-600"
          >
            삭제
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="self-start rounded-full border border-dashed border-line px-4 py-2 text-xs font-bold text-muted hover:border-accent/40 hover:text-accent-strong"
      >
        + 트랙 추가
      </button>
    </div>
  );
}
