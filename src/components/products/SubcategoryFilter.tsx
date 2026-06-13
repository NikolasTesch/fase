"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface SubcategoryFilterItem {
  slug: string;
  name: string;
}

interface SubcategoryFilterProps {
  subcategories: SubcategoryFilterItem[];
  activeSlug?: string;
}

export function SubcategoryFilter({
  subcategories,
  activeSlug,
}: SubcategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSlug = activeSlug ?? searchParams.get("sub") ?? undefined;

  if (subcategories.length === 0) {
    return null;
  }

  function handleAll() {
    router.push(pathname);
  }

  function handleSelect(slug: string) {
    router.push(`${pathname}?sub=${slug}`);
  }

  const pillBase =
    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar por subcategoria"
    >
      <button
        type="button"
        onClick={handleAll}
        aria-pressed={!currentSlug}
        className={cn(
          pillBase,
          !currentSlug
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-muted"
        )}
      >
        Todos
      </button>
      {subcategories.map((subcategory) => {
        const isActive = currentSlug === subcategory.slug;
        return (
          <button
            key={subcategory.slug}
            type="button"
            onClick={() => handleSelect(subcategory.slug)}
            aria-pressed={isActive}
            className={cn(
              pillBase,
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {subcategory.name}
          </button>
        );
      })}
    </div>
  );
}
