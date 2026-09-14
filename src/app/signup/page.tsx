import Link from "next/link";

export default function SignupSelectPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-black text-ink sm:text-3xl">MU:RATHON에 오신 걸 환영해요</h1>
      <p className="mt-2 text-muted">어떤 자격으로 가입하시겠어요?</p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/signup/fan"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-8 transition hover:border-accent/50 hover:bg-accent/5"
        >
          <span className="text-4xl">🎧</span>
          <span className="text-lg font-bold text-ink">팬으로 가입하기</span>
          <span className="text-sm text-muted">
            좋아하는 아티스트를 직접 후원하고 응원해요
          </span>
          <span className="mt-2 rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink transition group-hover:bg-accent group-hover:text-white">
            Join as a Fan
          </span>
        </Link>

        <Link
          href="/signup/artist"
          className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-8 transition hover:border-accent/50 hover:bg-accent/5"
        >
          <span className="text-4xl">🎸</span>
          <span className="text-lg font-bold text-ink">아티스트로 가입하기</span>
          <span className="text-sm text-muted">
            음원과 굿즈를 팬에게 직접 판매하고 소통해요
          </span>
          <span className="mt-2 rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink transition group-hover:bg-accent group-hover:text-white">
            Join as an Artist
          </span>
        </Link>
      </div>
    </div>
  );
}
