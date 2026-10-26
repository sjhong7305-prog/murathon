"use client";

import { useActionState } from "react";
import { createAdminAction, type AdminFormState } from "./actions";

const initialState: AdminFormState = {};

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent";

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(createAdminAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm text-muted">새 관리자 이메일</label>
        <input name="newEmail" type="email" required className={FIELD_CLASS} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">새 관리자 비밀번호</label>
        <input name="newPassword" type="password" required className={FIELD_CLASS} />
      </div>
      <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3">
        <label className="mb-1 block text-sm font-semibold text-amber-700">
          본인 비밀번호 확인 (필수)
        </label>
        <input name="currentPassword" type="password" required className={FIELD_CLASS} />
      </div>

      {state?.error && (
        <p className="text-sm font-semibold text-rose-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm font-semibold text-emerald-700" role="status">
          관리자를 추가했어요.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "처리 중..." : "관리자 추가"}
      </button>
    </form>
  );
}
