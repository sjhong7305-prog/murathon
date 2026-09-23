export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** "3:42" — "" when the value is missing, never a literal "NaN:NaN". */
export function formatDuration(sec?: number): string {
  if (!sec && sec !== 0) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type DateInput = string | Date | null | undefined;

function toValidDate(value: DateInput): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "YYYY.MM.DD" — "-" when the value is missing or unparseable, never a literal "NaN". */
export function formatDate(value: DateInput): string {
  const d = toValidDate(value);
  if (!d) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** "YYYY.MM.DD HH:mm" — "-" when the value is missing or unparseable. */
export function formatDateTime(value: DateInput): string {
  const d = toValidDate(value);
  if (!d) return "-";
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "3시간 전" style relative time, falling back to formatDate past a week. */
export function formatRelativeTime(value: DateInput): string {
  const d = toValidDate(value);
  if (!d) return "-";
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(d);
}
