"use client";

import { Lock } from "lucide-react";
import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {};

function LoginMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  if (!message) return null;
  return (
    <p className="mt-4 flex items-center gap-2 rounded-xl bg-lime/40 px-4 py-3 text-sm font-semibold text-ink">
      <Lock aria-hidden className="size-4 shrink-0" />
      {message}
    </p>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">로그인</h1>
      <Suspense fallback={null}>
        <LoginMessage />
      </Suspense>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
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
            autoComplete="current-password"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
            placeholder="비밀번호를 입력해주세요"
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
          {pending ? "로그인 중..." : "로그인"}
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
