"use client";

import { useState, type KeyboardEvent } from "react";

export function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const cleaned = raw.trim().replace(/^#/, "");
    if (!cleaned) return;
    if (tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...tags, cleaned]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 focus-within:border-accent">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent-strong"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-accent-strong/70 hover:text-ink"
            aria-label={`${tag} 태그 삭제`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[100px] flex-1 bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-muted"
      />
    </div>
  );
}
