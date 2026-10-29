"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Pause, Play, Search, X } from "lucide-react";
import type { Artist, Product } from "@muraton/shared/types";
import { formatWon } from "@muraton/shared/format";
import { formatReleaseLabel } from "@muraton/shared/release-label";
import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import { TrackRows } from "@/components/album-track-list";
import { albumPlayerTracks } from "@/lib/album-player-tracks";
import { useProductLike } from "@/lib/use-product-like";
import { GENRES } from "@/lib/genres";

export type MusicArtist = Pick<Artist, "id" | "name" | "slug"> & Partial<Pick<Artist, "genre" | "genreTags">>;

/** Korean names artists commonly type for a genre, so free-text artist genres still match. */
const KOREAN_GENRE_NAMES: Record<string, string[]> = {
  acoustic: ["어쿠스틱"],
  ambient: ["앰비언트"],
  classical: ["클래식"],
  country: ["컨트리"],
  electronic: ["일렉트로닉", "전자음악", "edm"],
  folk: ["포크"],
  "hip-hop-rap": ["힙합", "랩", "hiphop", "rap"],
  jazz: ["재즈"],
  metal: ["메탈"],
  pop: ["팝", "kpop", "k-pop"],
  reggae: ["레게"],
  "rnb-soul": ["알앤비", "r&b", "rnb", "소울", "soul"],
  rock: ["록", "락"],
  soundtrack: ["ost", "사운드트랙"],
};

/**
 * Whether a release belongs to a genre (GENRES slug). The release's own genre wins; releases
 * without one fall back to their artist's genre tags / free-text genre.
 */
function inGenre(release: Product, artist: MusicArtist | undefined, slug: string) {
  if (release.genre) return release.genre === slug;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre || !artist) return false;
  const words = [...(artist.genreTags ?? []), artist.genre ?? ""]
    .join(" ")
    .toLowerCase()
    .split(/[\s,·/]+/)
    .filter(Boolean);
  const names = [genre.slug, ...genre.label.toLowerCase().split("/"), ...(KOREAN_GENRE_NAMES[slug] ?? [])];
  return names.some((name) => words.includes(name));
}

function isPlayable(release: Product) {
  return Boolean(release.previewAudioUrl) || Boolean(release.tracks?.some((t) => t.hasPreview));
}

function matches(release: Product, artist: MusicArtist | undefined, query: string) {
  if (!query) return true;
  const haystack = [
    release.title,
    artist?.name,
    release.genre,
    formatReleaseLabel(release),
    ...(release.tracks ?? []).map((t) => t.title),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

/** Number of columns the grid currently renders, read from its computed template so it follows the breakpoints. */
function useGridColumns(ref: React.RefObject<HTMLElement | null>) {
  const [columns, setColumns] = useState(2);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const template = getComputedStyle(el).gridTemplateColumns;
      setColumns(Math.max(1, template.split(" ").filter(Boolean).length));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return columns;
}

/** Music-only browse page: a music search on top of the release grid. */
export function MusicBrowser({
  releases,
  artists,
  initialQuery,
  initialGenre,
}: {
  releases: Product[];
  artists: MusicArtist[];
  initialQuery: string;
  initialGenre: string | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState<string | null>(initialGenre);
  const artistById = useMemo(() => new Map(artists.map((a) => [a.id, a])), [artists]);
  const trimmed = query.trim();
  const visible = releases.filter((r) => {
    const artist = artistById.get(r.artistId);
    return (!genre || inGenre(r, artist, genre)) && matches(r, artist, trimmed);
  });
  const genreLabel = GENRES.find((g) => g.slug === genre)?.label;

  // Keep the URL shareable without a server round trip for every keystroke.
  const syncUrl = (nextQuery: string, nextGenre: string | null) => {
    const params = new URLSearchParams({ type: "music" });
    if (nextGenre) params.set("genre", nextGenre);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    window.history.replaceState(null, "", `/search?${params}`);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    syncUrl(value, genre);
  };

  const selectGenre = (slug: string | null) => {
    setGenre(slug);
    syncUrl(query, slug);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mx-auto max-w-3xl">
        <label htmlFor="music-search" className="sr-only">
          음원 검색
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted" />
        <input
          id="music-search"
          type="search"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          placeholder="듣고 싶은 음원이나 아티스트를 검색해보세요"
          autoComplete="off"
          className={`h-14 w-full rounded-full border border-line bg-surface pl-13 text-[15px] text-ink sm:text-base ${query ? "pr-14" : "pr-5"} shadow-[0_8px_30px_rgba(28,27,24,0.06)] transition outline-none placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_4px_rgba(184,255,90,0.55)] [&::-webkit-search-cancel-button]:hidden`}
        />
        {query && (
          <button
            type="button"
            onClick={() => updateQuery("")}
            aria-label="검색어 지우기"
            className="absolute top-1/2 right-1.5 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-ink/6 hover:text-ink"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}
      </form>

      <nav aria-label="장르" className="mx-auto mt-5 max-w-5xl">
        <ul className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {[{ slug: null, label: "전체" }, ...GENRES].map((g) => {
            const active = genre === g.slug;
            return (
              <li key={g.slug ?? "all"} className="shrink-0">
                <button
                  type="button"
                  onClick={() => selectGenre(active && g.slug ? null : g.slug)}
                  aria-pressed={active}
                  className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${
                    active
                      ? "border-ink bg-ink text-cream"
                      : "border-line bg-surface text-ink hover:border-ink/40 hover:bg-lime/30"
                  }`}
                >
                  {g.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Result counts are announced to screen readers only. */}
      <p className="sr-only" aria-live="polite">
        {`${genreLabel ? `${genreLabel} ` : ""}${trimmed ? `"${trimmed}" ` : ""}음원 ${visible.length}개`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
          <p>
            {genreLabel && !trimmed
              ? `아직 ${genreLabel} 음원이 없어요.`
              : "찾는 음원이 없어요. 아티스트 이름이나 곡 제목으로 다시 검색해보세요."}
          </p>
          {genre && (
            <button
              type="button"
              onClick={() => selectGenre(null)}
              className="mt-3 min-h-11 font-bold text-ink underline-offset-4 hover:underline"
            >
              전체 장르 보기
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <ReleaseGrid releases={visible} artists={artists} />
        </div>
      )}
    </div>
  );
}

/**
 * Release card grid. Clicking a card starts its title track and opens a detail panel directly
 * under that card's row (the cards themselves stay as they are).
 */
export function ReleaseGrid({ releases, artists }: { releases: Product[]; artists: MusicArtist[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const columns = useGridColumns(gridRef);
  const { current, playQueue } = usePlayer();
  const artistById = useMemo(() => new Map(artists.map((a) => [a.id, a])), [artists]);

  const openIndex = releases.findIndex((r) => r.id === openId);
  const openRelease = openIndex >= 0 ? releases[openIndex] : null;
  // The panel goes after the last card in the open card's row.
  const panelAfterIndex =
    openIndex >= 0 ? Math.min(releases.length - 1, Math.floor(openIndex / columns) * columns + columns - 1) : -1;

  const artistRefFor = (release: Product) => artistById.get(release.artistId) ?? { name: "알 수 없는 아티스트", slug: "" };

  const handleCardClick = (release: Product) => {
    if (openId === release.id) {
      setOpenId(null);
      return;
    }
    setOpenId(release.id);
    // Opening a card starts its title track, unless this release is already what's playing.
    if (!isPlayable(release) || current?.productId === release.id) return;
    const queue = albumPlayerTracks(release, artistRefFor(release));
    const titleIndex = [...(release.tracks ?? [])]
      .sort((a, b) => a.trackNumber - b.trackNumber)
      .findIndex((t) => t.isTitle);
    if (queue.length > 0) playQueue(queue, Math.max(0, titleIndex));
  };

  return (
    <ul ref={gridRef} className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {releases.map((release, i) => (
        <Fragment key={release.id}>
          <li>
            <MusicCard
              release={release}
              artistName={artistRefFor(release).name}
              open={openId === release.id}
              panelId={`music-panel-${release.id}`}
              onClick={() => handleCardClick(release)}
            />
          </li>
          {openRelease && i === panelAfterIndex && (
            <li className="col-span-full">
              <ReleasePanel
                key={openRelease.id}
                release={openRelease}
                artist={artistRefFor(openRelease)}
                caretPercent={(((openIndex % columns) + 0.5) / columns) * 100}
                onClose={() => setOpenId(null)}
              />
            </li>
          )}
        </Fragment>
      ))}
    </ul>
  );
}

/** Same look as the store's ProductCard, but a button: it plays and opens details instead of navigating. */
function MusicCard({
  release,
  artistName,
  open,
  panelId,
  onClick,
}: {
  release: Product;
  artistName: string;
  open: boolean;
  panelId: string;
  onClick: () => void;
}) {
  const { current, playing } = usePlayer();
  const isNowPlaying = current?.productId === release.id && playing;
  const isPwyw = release.minPrice === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      className={`group flex w-full flex-col gap-3 rounded-2xl p-3 text-left transition ${
        open ? "bg-surface shadow-[0_0_0_2px_var(--ink)]" : "hover:bg-surface"
      }`}
    >
      <span className="relative block w-full">
        <CoverArt
          gradient={release.coverColor}
          label={release.title}
          type={release.type}
          imageUrl={release.imageUrl}
          hasSecret={Boolean(release.secretContent)}
        />
        {isPlayable(release) && (
        <span
          aria-hidden
          className={`absolute right-2.5 bottom-2.5 z-10 grid size-10 place-items-center rounded-full bg-lime text-ink shadow-[0_6px_16px_rgba(20,20,18,0.25)] transition duration-200 ${
            open || isNowPlaying ? "opacity-100" : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }`}
        >
          {isNowPlaying ? (
            <span className="flex h-3.5 items-end gap-0.5">
              <span className="eq-bar h-full w-0.5 bg-ink" />
              <span className="eq-bar h-full w-0.5 bg-ink [animation-delay:-0.3s]" />
              <span className="eq-bar h-full w-0.5 bg-ink [animation-delay:-0.6s]" />
            </span>
          ) : (
            <Play className="size-4 translate-x-px fill-current" />
          )}
        </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-bold text-ink group-hover:underline">{release.title}</span>
        <span className="block truncate text-sm text-muted">
          {artistName} · {formatReleaseLabel(release)}
        </span>
        <span className="mt-1 block text-sm">
          {isPwyw ? (
            <>
              <span className="font-semibold text-ink tabular-nums">{formatWon(release.suggestedPrice)}</span>{" "}
              <span className="font-bold text-accent-strong">(자율 가격, 0원부터)</span>
            </>
          ) : (
            <span className="font-semibold text-accent-strong tabular-nums">{formatWon(release.suggestedPrice)}부터</span>
          )}
        </span>
      </span>
    </button>
  );
}

function ReleasePanel({
  release,
  artist,
  caretPercent,
  onClose,
}: {
  release: Product;
  artist: Pick<Artist, "name" | "slug">;
  caretPercent: number;
  onClose: () => void;
}) {
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const { current, playing, toggle, playQueue } = usePlayer();

  // Bring the details into view when they open below the fold.
  useEffect(() => {
    panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  const { liked, toggleLike } = useProductLike(release.id);
  const playable = isPlayable(release);
  const isThisRelease = current?.productId === release.id;
  const description = release.description || release.longDescription;
  const hasTracks = (release.tracks?.length ?? 0) > 0 || release.type === "track";

  return (
    <section
      ref={panelRef}
      id={`music-panel-${release.id}`}
      aria-labelledby={headingId}
      className="music-panel relative mt-2 mb-4 rounded-3xl bg-surface shadow-[0_0_0_1px_var(--line),0_20px_50px_rgba(28,27,24,0.08)]"
    >
      <span
        aria-hidden
        className="absolute -top-2 size-4 -translate-x-1/2 rotate-45 rounded-tl-sm bg-surface shadow-[-1px_-1px_0_var(--line)]"
        style={{ left: `${caretPercent}%` }}
      />
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-[0.16em] text-muted">{formatReleaseLabel(release).toUpperCase()}</p>
              <h2 id={headingId} className="mt-1.5 text-2xl leading-tight font-bold tracking-tight text-ink sm:text-3xl">
                {release.title}
              </h2>
              <p className="mt-1 text-base font-semibold text-ink/80">{artist.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="상세 닫기"
              className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-ink/6 hover:text-ink"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          {description ? (
            <p className="mt-4 line-clamp-4 max-w-[60ch] text-[15px] leading-relaxed text-ink/85">{description}</p>
          ) : null}
          {!playable && <p className="mt-3 text-sm text-muted">아직 미리듣기 음원이 등록되지 않았어요.</p>}

          <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row sm:flex-wrap">
            {playable && (
              <button
                type="button"
                onClick={() =>
                  isThisRelease ? toggle() : playQueue(albumPlayerTracks(release, artist), 0)
                }
                aria-label={isThisRelease && playing ? "일시정지" : "재생"}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-ink transition hover:scale-[1.02]"
              >
                {isThisRelease && playing ? (
                  <Pause aria-hidden className="size-4 fill-current" />
                ) : (
                  <Play aria-hidden className="size-4 fill-current" />
                )}
                {isThisRelease && playing ? "일시정지" : "재생"}
              </button>
            )}
            <Link
              href={`/products/${release.id}`}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              Go to album
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={toggleLike}
              aria-pressed={liked}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold transition ${
                liked ? "border-orange/60 bg-orange/10 text-ink" : "border-line text-ink hover:border-ink/30"
              }`}
            >
              <Heart aria-hidden className={`size-4 ${liked ? "fill-orange text-orange" : ""}`} />
              {liked ? "위시리스트에 담김" : "위시리스트"}
            </button>
          </div>
        </div>

        {hasTracks ? (
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-ink">
              수록곡 <span className="font-semibold text-muted tabular-nums">{albumPlayerTracks(release, artist).length}</span>
            </p>
            <TrackRows product={release} artist={artist} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
