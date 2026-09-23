"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupAction, type SignupActionState } from "./actions";

const initialState: SignupActionState = {};

type Intent = "fan" | "artist";

function SignupForm() {
  const searchParams = useSearchParams();
  const [intent, setIntent] = useState<Intent>(
    searchParams.get("intent") === "artist" ? "artist" : "fan"
  );
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-black text-ink sm:text-3xl">MU:RATHON에 오신 걸 환영해요</h1>
      <p className="mt-2 text-muted">가입 목적을 골라주세요. 가입 후에도 언제든 바꿀 수 있어요.</p>

      <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface p-1.5">
        <button
          type="button"
          onClick={() => setIntent("fan")}
          className={`flex flex-col items-center gap-1.5 rounded-xl py-4 text-sm font-bold transition ${
            intent === "fan" ? "bg-accent text-white" : "text-muted hover:text-ink"
          }`}
        >
          <span className="text-2xl">🎧</span>
          음악 듣고 후원하기
        </button>
        <button
          type="button"
          onClick={() => setIntent("artist")}
          className={`flex flex-col items-center gap-1.5 rounded-xl py-4 text-sm font-bold transition ${
            intent === "artist" ? "bg-accent text-white" : "text-muted hover:text-ink"
          }`}
        >
          <span className="text-2xl">🎸</span>
          내 음악 올리기
        </button>
      </div>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="intent" value={intent} />

        <div>
          <label className="mb-1 block text-sm text-muted">닉네임</label>
          <input
            required
            name="nickname"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="음악듣는사람"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">이메일</label>
          <input
            required
            type="email"
            name="email"
            autoComplete="username"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">비밀번호</label>
          <input
            required
            type="password"
            name="password"
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="8자 이상 입력해주세요"
          />
        </div>

        {state?.error && (
          <p className="text-sm font-semibold text-rose-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "가입 중..." : intent === "artist" ? "가입하고 아티스트 페이지 만들기" : "가입하기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-accent-strong hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
