"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function FanSignupPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login("follower");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-black text-ink">가입이 완료됐어요</h1>
        <p className="mt-2 text-muted">
          {nickname || "팬"}님, MU:RATHON에 오신 걸 환영해요!
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          아티스트 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold text-accent-strong">🎧 Join as a Fan</p>
      <h1 className="mt-1 text-2xl font-black text-ink">팬으로 가입하기</h1>
      <p className="mt-2 text-sm text-muted">
        좋아하는 아티스트를 직접 후원하고 응원 메시지를 남겨보세요.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">닉네임</label>
          <input
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="음악듣는사람"
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
            placeholder="you@example.com"
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
          가입하기
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        아티스트이신가요?{" "}
        <Link href="/signup/artist" className="font-semibold text-accent-strong hover:underline">
          아티스트로 가입하기
        </Link>
      </p>
    </div>
  );
}
