"use server";

import { redirect } from "next/navigation";
import { loginUser } from "@/lib/auth";

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginActionState | undefined,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = await loginUser(email, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/");
}
