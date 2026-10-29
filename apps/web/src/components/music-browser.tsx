"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Heart, Search, X } from "lucide-react";
import type { Artist, Product } from "@muraton/shared/types";
import { formatWon } from "@muraton/shared/format";
import { formatReleaseLabel } from "@muraton/shared/release-label";
import { usePlayer } from "@/context/player-context";
import { CoverArt } from "@/components/cover-art";
import { TrackRows } from "@/components/album-track-list";
import { albumPlayerTracks } from "@/lib/album-player-tracks";
import { useProductLike } from "@/lib/use-product-like";

export type MusicArtist = Pick<Artist, "id" | "name" | "slug">;

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

/** Music-only browse list: search on top, and each release opens inline (accordion) and starts its title track. */
export function MusicBrowser({
  releases,
  artists,
  initialQuery,
}: {
  releases: Product[];
  artists: MusicArtist[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [openId, setOpenId] = useState<string | null>(null);
  const artistById = useMemo(() => new Map(artists.map((a) => [a.id, a])), [artists]);
  const trimmed = query.trim();
  const visible = releases.filter((r) => matches(r, artistById.get(r.artistId), trimmed));

  const updateQuery = (value: string) => {
    setQuery(value);
    // Keep the URL shareable without a server round trip for every keystroke.
    const params = new URLSearchParams({ type: "music" });
    if (value.trim()) params.set("q", value.trim());
    window.history.replaceState(null, "", `/search?${params}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
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

      <p className="mt-6 mb-3 px-1 text-sm text-muted tabular-nums" aria-live="polite">
        {trimmed ? `"${trimmed}" 검색 결과 ${visible.length}개` : `음원 ${visible.length}개`}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
          찾는 음원이 없어요. 아티스트 이름이나 곡 제목으로 다시 검색해보세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((release) => (
            <li key={release.id}>
              <ReleaseAccordion
                release={release}
                artist={artistById.get(release.artistId)}
                open={openId === release.id}
                onToggle={(next) => setOpenId(next ? release.id : null)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReleaseAccordion({
  release,
  artist,
  open,
  onToggle,
}: {
  release: Product;
  artist: MusicArtist | undefined;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  const panelId = useId();
  const { current, playing, playQueue } = usePlayer();
  const { liked, toggleLike } = useProductLike(release.id);
  const artistRef = artist ?? { name: "알 수 없는 아티스트", slug: "" };
  const isNowPlaying = current?.productId === release.id && playing;
  const playable = isPlayable(release);
  const trackCount = release.tracks?.length ?? 0;
  const description = release.description || release.longDescription;

  const handleToggle = () => {
    const opening = !open;
    onToggle(opening);
    // Opening a card starts its title track, unless this release is already what's playing.
    if (opening && playable && current?.productId !== release.id) {
      const queue = albumPlayerTracks(release, artistRef);
      const titleIndex = (release.tracks ?? [])
        .slice()
        .sort((a, b) => a.trackNumber - b.trackNumber)
        .findIndex((t) => t.isTitle);
      if (queue.length > 0) playQueue(queue, Math.max(0, titleIndex));
    }
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow] duration-300 ${
        open ? "border-ink/25 shadow-[0_16px_40px_rgba(28,27,24,0.08)]" : "border-line hover:border-ink/20"
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-4 p-3 text-left sm:p-4"
        >
          <span className="relative w-16 shrink-0 rounded-xl bg-cream ring-1 ring-ink/8 sm:w-20">
            <CoverArt
              gradient={release.coverColor}
              label={release.title}
              imageUrl={release.imageUrl}
              hideLabel
              rounded="rounded-xl"
              sizes="80px"
            />
            {isNowPlaying && (
              <span aria-hidden className="absolute right-1 bottom-1 flex h-4 items-end gap-0.5 rounded-sm bg-ink/70 px-1 py-0.5">
                <span className="eq-bar h-full w-0.5 bg-lime" />
                <span className="eq-bar h-full w-0.5 bg-lime [animation-delay:-0.3s]" />
                <span className="eq-bar h-full w-0.5 bg-lime [animation-delay:-0.6s]" />
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-bold text-ink sm:text-lg">{release.title}</span>
            <span className="mt-0.5 block truncate text-sm text-muted">
              {artistRef.name}
              <span aria-hidden> · </span>
              {formatReleaseLabel(release)}
              {trackCount > 1 ? ` · ${trackCount}곡` : ""}
            </span>
            <span className="mt-1 block text-sm font-semibold text-accent-strong tabular-nums">
              {release.minPrice === 0 ? "0원부터 자율 가격" : `${formatWon(release.suggestedPrice)}부터`}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className={`size-5 shrink-0 text-muted transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-label={`${release.title} 상세`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        inert={!open}
      >
        <div className="min-h-0">
          <div className="border-t border-line px-3 pt-5 pb-4 sm:px-4">
            {description && (
              <p className="line-clamp-3 max-w-[65ch] px-1 text-[15px] leading-relaxed text-ink/85">{description}</p>
            )}
            {!playable && (
              <p className="mt-2 px-1 text-xs text-muted">아직 미리듣기 음원이 등록되지 않았어요.</p>
            )}

            {(release.tracks?.length ?? 0) > 0 || release.type === "track" ? (
              <div className="mt-4">
                <TrackRows product={release} artist={artistRef} />
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={`/products/${release.id}`}
                className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong sm:flex-none"
              >
                앨범과 스토리 보기
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
        </div>
      </div>
    </article>
  );
}
