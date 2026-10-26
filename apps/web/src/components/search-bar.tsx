"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <form onSubmit={handleSubmit} className={`relative min-w-0 ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
        🔍
      </span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="아티스트, 음원, 굿즈 검색"
        className="w-full rounded-full border border-gray-300 bg-surface py-2 pl-9 pr-3 text-sm text-ink shadow-inner outline-none placeholder:text-muted transition focus:border-accent-strong focus:shadow-[0_0_0_3px_rgba(139,117,215,0.35)]"
      />
    </form>
  );
}
