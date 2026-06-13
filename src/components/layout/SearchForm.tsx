"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchForm() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/busca?q=${encodeURIComponent(trimmed)}`);
    setExpanded(false);
    setQuery("");
  }

  function handleIconClick() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar produtos"
      className="relative flex items-center"
    >
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => {
          if (!query) setExpanded(false);
        }}
        placeholder="Buscar produtos…"
        aria-label="Buscar produtos"
        className={cn(
          "h-9 rounded-lg border border-border bg-muted/50 px-3 py-1 text-sm",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          "transition-all duration-200",
          expanded ? "w-48 opacity-100 md:w-56" : "w-0 px-0 opacity-0"
        )}
      />
      <button
        type={expanded && query ? "submit" : "button"}
        onClick={expanded ? undefined : handleIconClick}
        aria-label="Buscar"
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground",
          "transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <Search className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
