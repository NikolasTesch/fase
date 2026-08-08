import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, pageCount, buildHref }: PaginationProps) {
  if (pageCount <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const linkClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "gap-1.5",
  );

  return (
    <nav
      aria-label="Paginação"
      data-testid="pagination"
      className="flex items-center justify-center gap-2"
    >
      {hasPrev ? (
        <Link href={buildHref(page - 1)} className={linkClass} aria-label="Página anterior">
          <ChevronLeft />
          Anterior
        </Link>
      ) : (
        <span
          className={cn(linkClass, "pointer-events-none opacity-50")}
          aria-disabled="true"
        >
          <ChevronLeft />
          Anterior
        </span>
      )}

      <span className="text-sm text-muted-foreground">
        Página {page} de {pageCount}
      </span>

      {hasNext ? (
        <Link href={buildHref(page + 1)} className={linkClass} aria-label="Próxima página">
          Próxima
          <ChevronRight />
        </Link>
      ) : (
        <span
          className={cn(linkClass, "pointer-events-none opacity-50")}
          aria-disabled="true"
        >
          Próxima
          <ChevronRight />
        </span>
      )}
    </nav>
  );
}
