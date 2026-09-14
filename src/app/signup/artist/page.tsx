"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function ArtistSignupPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bandName, setBandName] = useState("");
  const [genre, setGenre] = useState("");
  const [link, setLink] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login("artist");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-black text-ink">가입 신청이 완료됐어요</h1>
        <p className="mt-2 text-muted">
          {bandName || "아티스트"}님, MU:RATHON과 함께해주셔서 감사해요!
        </p>
        <p className="mt-1 text-xs text-muted">
          검수 후 아티스트 대시보드 이용 권한이 열려요. (프로토타입 목업)
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          아티스트 대시보드 미리보기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold text-accent-strong">🎸 Join as an Artist</p>
      <h1 className="mt-1 text-2xl font-black text-ink">아티스트로 가입하기</h1>
      <p className="mt-2 text-sm text-muted">
        유통사 수수료 없이 팬에게 직접 음원과 굿즈를 판매해보세요.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">아티스트 / 밴드명</label>
          <input
            required
            value={bandName}
            onChange={(e) => setBandName(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="원더 스태틱"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">장르</label>
          <input
            required
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="예: 힙합 / 솔로, 밴드, 재즈 등"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">SNS / 포트폴리오 링크</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="https://instagram.com/yourband"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">이메일</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="band@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">비밀번호</label>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="8자 이상 입력해주세요"
          />
        </div>

        <p className="text-xs text-muted">
          프로토타입이므로 실제 계정이 생성되지 않습니다.
        </p>

        <button
          type="submit"
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          가입 신청하기
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        팬으로 가입하시겠어요?{" "}
        <Link href="/signup/fan" className="font-semibold text-accent-strong hover:underline">
          팬으로 가입하기
        </Link>
      </p>
    </div>
  );
}
