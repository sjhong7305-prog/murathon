import Link from "next/link";

export function LeftRail({
  trendingTags,
  activeTag,
  onSelectTag,
  communityArtists,
}: {
  trendingTags: { tag: string; count: number }[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  communityArtists: { name: string; slug: string | null }[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-surface p-5">
        <p className="text-sm font-bold text-ink">Trending Tags</p>
        {trendingTags.length === 0 ? (
          <p className="mt-2 text-xs text-muted">아직 태그가 달린 글이 없어요.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {trendingTags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(activeTag === tag ? null : tag)}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                  activeTag === tag
                    ? "bg-accent text-white"
                    : "bg-accent/10 text-accent-strong hover:bg-accent/20"
                }`}
              >
                #{tag} <span className="opacity-70">{count}</span>
              </button>
            ))}
          </div>
        )}
        {activeTag && (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className="mt-2 text-xs font-semibold text-muted hover:text-ink"
          >
            필터 해제 ×
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-surface p-5">
        <p className="text-sm font-bold text-ink">커뮤니티의 아티스트</p>
        {communityArtists.length === 0 ? (
          <p className="mt-2 text-xs text-muted">아직 활동 중인 아티스트가 없어요.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {communityArtists.map((artist) =>
              artist.slug ? (
                <li key={artist.name}>
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="text-sm font-semibold text-ink hover:text-accent-strong"
                  >
                    {artist.name}
                  </Link>
                </li>
              ) : (
                <li key={artist.name} className="text-sm font-semibold text-ink">
                  {artist.name}
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
