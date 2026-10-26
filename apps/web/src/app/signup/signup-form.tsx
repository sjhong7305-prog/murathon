"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupActionState } from "./actions";

const initialState: SignupActionState = {};

export function SignupForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-black text-ink sm:text-3xl">뮤라톤 시작하기</h1>
      <p className="mt-2 text-muted">좋아하는 음악을 모으고, 아티스트의 소식을 받아보세요.</p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}

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
          {pending ? "가입 중..." : "가입하기"}
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
