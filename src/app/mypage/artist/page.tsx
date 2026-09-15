"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { artists } from "@/lib/data";
import { TagInput } from "@/components/tag-input";
import { FanMessageFeed } from "@/components/fan-message-feed";
import {
  addBroadcast,
  getBroadcasts,
  type Broadcast,
  type BroadcastTarget,
} from "@/lib/broadcast-storage";
import { getLocalIntroduction, setLocalIntroduction } from "@/lib/artist-profile-storage";

const ME = artists[0];
const REGIONS = ["서울", "인천", "제주", "부산"];
const AMOUNT_TIERS = ["5,000원 이상", "10,000원 이상", "30,000원 이상"];

const TARGET_LABEL: Record<BroadcastTarget, string> = {
  all: "전체 팔로워",
  amount: "구매 금액별",
  region: "지역별",
};

type Tab = "profile" | "messages" | "community";

function formatSentAt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ArtistMyPage() {
  const [tab, setTab] = useState<Tab>("messages");

  const [name, setName] = useState(ME?.name ?? "");
  const [bio, setBio] = useState(ME?.introduction ?? "");
  const [genres, setGenres] = useState<string[]>(
    ME?.genre.split("/").map((g) => g.trim()).filter(Boolean) ?? []
  );
  const [snsLink, setSnsLink] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [target, setTarget] = useState<BroadcastTarget>("all");
  const [amountTier, setAmountTier] = useState(AMOUNT_TIERS[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  useEffect(() => {
    if (!ME) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate sent broadcast history from localStorage post-mount
    setBroadcasts(getBroadcasts(ME.id));
    const savedIntroduction = getLocalIntroduction(ME.id);
    if (savedIntroduction) {
      setBio(savedIntroduction);
    }
  }, []);

  if (!ME) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">아직 등록된 아티스트가 없어요</h1>
        <p className="mt-2 text-sm text-muted">
          음원을 업로드하면 마이페이지가 활성화돼요.
        </p>
        <Link
          href="/dashboard/upload/track"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          🎵 음원 업로드하기
        </Link>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalIntroduction(ME.id, bio);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = broadcastMessage.trim();
    if (!trimmed) return;
    const entry = addBroadcast(ME.id, {
      message: trimmed,
      target,
      targetDetail: target === "amount" ? amountTier : target === "region" ? region : undefined,
    });
    setBroadcasts((prev) => [entry, ...prev]);
    setBroadcastMessage("");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-strong">🎸 Artist My Page</p>
          <h1 className="mt-1 text-2xl font-black text-ink">{ME.name}</h1>
          <p className="mt-1 text-sm text-muted">{ME.genre} · {ME.location}</p>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/20"
        >
          대시보드로
        </Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-line text-sm">
        {(
          [
            ["messages", "팬 메시지"],
            ["community", "커뮤니티"],
            ["profile", "프로필"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2.5 font-bold transition ${
              tab === key
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "messages" && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">
            팬들이 남긴 후원 메시지와 답변을 확인하고 이모지로 반응해보세요. (프로토타입 목업 데이터)
          </p>
          <FanMessageFeed />
        </div>
      )}

      {tab === "community" && (
        <div className="mt-6 flex flex-col gap-6">
          <form
            onSubmit={handleSendBroadcast}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <p className="text-sm font-bold text-ink">📢 팬에게 공지 보내기</p>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="예: 새 곡 작업 중이에요! / 이번 주말 공연 있어요!"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="text-sm text-muted">대상</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as BroadcastTarget)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                <option value="all">전체 팔로워</option>
                <option value="amount">구매 금액별</option>
                <option value="region">지역별</option>
              </select>

              {target === "amount" && (
                <select
                  value={amountTier}
                  onChange={(e) => setAmountTier(e.target.value)}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                >
                  {AMOUNT_TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              )}

              {target === "region" && (
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
            >
              공지 보내기
            </button>
          </form>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">보낸 공지 ({broadcasts.length})</p>
            {broadcasts.length === 0 ? (
              <p className="text-sm text-muted">아직 보낸 공지가 없어요.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {broadcasts.map((b) => (
                  <div key={b.id} className="rounded-lg border border-line bg-surface p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-strong">
                        {TARGET_LABEL[b.target]}
                        {b.targetDetail ? ` · ${b.targetDetail}` : ""}
                      </span>
                      <span className="text-xs text-muted">{formatSentAt(b.sentAt)}</span>
                    </div>
                    <p className="mt-1.5 text-ink">{b.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <form onSubmit={handleSaveProfile} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted">아티스트 / 밴드명</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">장르</label>
            <TagInput
              tags={genres}
              onChange={setGenres}
              placeholder="장르 입력 후 Enter (예: HipHop, Solo, Band, Jazz)"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">SNS / 포트폴리오 링크</label>
            <input
              type="url"
              value={snsLink}
              onChange={(e) => setSnsLink(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
              placeholder="https://instagram.com/yourband"
            />
          </div>

          <p className="text-xs text-muted">
            프로토타입이므로 실제로 저장되지 않습니다.
          </p>

          <button
            type="submit"
            className="self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            {profileSaved ? "저장됐어요 ✓" : "프로필 저장"}
          </button>
        </form>
      )}
    </div>
  );
}
