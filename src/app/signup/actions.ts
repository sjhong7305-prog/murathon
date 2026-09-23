"use server";

import { redirect } from "next/navigation";
import { signup } from "@/lib/auth";

export interface SignupActionState {
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(
  _prevState: SignupActionState | undefined,
  formData: FormData
): Promise<SignupActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const intent = String(formData.get("intent") ?? "fan");

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "올바른 이메일 형식을 입력해주세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 해요." };
  }
  if (!nickname) {
    return { error: "닉네임을 입력해주세요." };
  }

  const result = await signup({ email, password, nickname });
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(intent === "artist" ? "/artist/new" : "/");
}
