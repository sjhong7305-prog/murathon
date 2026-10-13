"use client";

import { useRef, useState } from "react";
import { FeedComposer } from "./feed-composer";
import { FeedInfiniteList, type FeedInfiniteListHandle } from "./feed-infinite-list";
import type { FeedPage } from "@/lib/artist-feed";

export interface MemberOption {
  id: string;
  name: string;
  imageUrl: string | null;
}

export function ArtistFeedTabContent({
  artistId,
  members,
  initialFeed,
  isOwner,
  ownerAvatarUrl,
}: {
  artistId: string;
  members: MemberOption[];
  initialFeed: FeedPage;
  isOwner: boolean;
  ownerAvatarUrl: string | null;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const listRef = useRef<FeedInfiniteListHandle>(null);
  const endpoint = selectedMemberId
    ? `/api/artists/${artistId}/feed?memberId=${selectedMemberId}`
    : `/api/artists/${artistId}/feed`;

  return (
    <div className="mx-auto w-full max-w-[720px]">
      {isOwner && (
        <FeedComposer
          artistId={artistId}
          authorAvatarUrl={ownerAvatarUrl}
          onPosted={(post) => listRef.current?.prepend(post)}
        />
      )}

      {members.length > 1 && (
        <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
          <button
            type="button"
            onClick={() => setSelectedMemberId(null)}
            className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition"
            style={{
              borderColor: selectedMemberId === null ? "var(--artist-accent)" : "color-mix(in srgb, var(--artist-text) 20%, transparent)",
              backgroundColor: selectedMemberId === null ? "var(--artist-accent)" : "transparent",
              color: selectedMemberId === null ? "#fff" : "var(--artist-text)",
            }}
          >
            전체
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMemberId(m.id)}
              className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition"
              style={{
                borderColor: selectedMemberId === m.id ? "var(--artist-accent)" : "color-mix(in srgb, var(--artist-text) 20%, transparent)",
                backgroundColor: selectedMemberId === m.id ? "var(--artist-accent)" : "transparent",
                color: selectedMemberId === m.id ? "#fff" : "var(--artist-text)",
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      <FeedInfiniteList
        ref={selectedMemberId === null ? listRef : undefined}
        key={selectedMemberId ?? "all"}
        endpoint={endpoint}
        initialPosts={selectedMemberId === null ? initialFeed.posts : null}
        initialNextCursor={selectedMemberId === null ? initialFeed.nextCursor : null}
      />
    </div>
  );
}
