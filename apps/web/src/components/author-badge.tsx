import type { AuthorType } from "@/lib/community-storage";

export function AuthorBadge({ type }: { type: AuthorType }) {
  if (type === "artist") {
    return (
      <span className="shrink-0 rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-ink">
        아티스트
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-tone px-2 py-0.5 text-[11px] font-bold text-muted">
      팔로워
    </span>
  );
}
