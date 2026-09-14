"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

type LoginType = "fan" | "artist";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<LoginType>("fan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginType === "artist" ? "artist" : "follower");
    router.push(loginType === "artist" ? "/dashboard" : "/");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold text-accent-strong">
        {loginType === "artist" ? "🎸 Artist Login" : "🎧 Fan Login"}
      </p>
      <h1 className="mt-1 text-2xl font-black text-ink">로그인</h1>
      <p className="mt-2 text-sm text-muted">MU:RATHON에서 다시 만나요.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setLoginType("fan")}
          className={`rounded-full py-2 text-sm font-bold transition ${
            loginType === "fan"
              ? "bg-accent text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          팬 로그인
        </button>
        <button
          type="button"
          onClick={() => setLoginType("artist")}
          className={`rounded-full py-2 text-sm font-bold transition ${
            loginType === "artist"
              ? "bg-accent text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          아티스트 로그인
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="비밀번호를 입력해주세요"
          />
        </div>

        <p className="text-xs text-muted">
          프로토타입이므로 실제 인증이 이루어지지 않습니다.
        </p>

        <button
          type="submit"
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-accent-strong hover:underline">
          가입하기
        </Link>
      </p>
    </div>
  );
}
