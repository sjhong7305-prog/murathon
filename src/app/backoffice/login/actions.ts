"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/admin-auth";

export interface LoginActionState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginActionState | undefined,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = await login(email, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/backoffice");
}
