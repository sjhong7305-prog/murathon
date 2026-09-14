import type { AuthorType } from "@/lib/community-storage";

export function AuthorBadge({ type }: { type: AuthorType }) {
  if (type === "artist") {
    return (
      <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-strong">
        🎸 Artist
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-bold text-sky-700">
      🎧 Follower
    </span>
  );
}
