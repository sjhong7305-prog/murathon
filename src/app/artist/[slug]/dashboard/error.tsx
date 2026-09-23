"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * Catches uncaught render errors anywhere under /artist/[slug]/dashboard (including the upload
 * wizards) so a bug surfaces as a readable message with a way back, not the generic Next.js error
 * page — the error's real .message is always available here since Next only redacts it for
 * Server Component throws, and this boundary only ever wraps Client Components.
 */
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-black text-ink">문제가 발생했어요</h1>
      <p className="mt-2 text-sm text-muted">
        페이지를 표시하는 중 오류가 발생했어요. 다시 시도해도 안 되면 잠시 후 다시 방문해주세요.
      </p>

      {process.env.NODE_ENV !== "production" && (
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 text-left text-xs text-rose-700">
          {error.message}
          {error.digest ? `\n(digest: ${error.digest})` : ""}
        </pre>
      )}

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-black/20"
        >
          다시 시도
        </button>
        <Link
          href={slug ? `/artist/${slug}/dashboard` : "/"}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-strong"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
