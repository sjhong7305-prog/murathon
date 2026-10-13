import { redirect } from "next/navigation";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; next?: string }>;
}) {
  const { intent, next } = await searchParams;

  if (intent) {
    redirect(next ? `/signup?next=${encodeURIComponent(next)}` : "/signup");
  }

  return <SignupForm next={next} />;
}
