import Link from "next/link";

export function LoginRequired({
  title = "로그인이 필요해요",
  description = "아티스트 계정으로 로그인하면 이용할 수 있어요.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-black text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link
          href="/login"
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-strong"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-line px-6 py-3 text-sm font-bold text-ink hover:border-black/30"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
