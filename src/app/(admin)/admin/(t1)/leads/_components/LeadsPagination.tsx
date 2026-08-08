"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadsPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function LeadsPagination({ page, pageCount, onPageChange }: LeadsPaginationProps) {
  if (pageCount <= 1) return null;

  const linkClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "gap-1.5",
  );

  return (
    <nav
      aria-label="Paginação"
      data-testid="pagination"
      className="flex items-center justify-center gap-2 mt-6"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={linkClass}
        aria-label="Página anterior"
      >
        <ChevronLeft />
        Anterior
      </button>

      <span className="text-sm text-muted-foreground">
        Página {page} de {pageCount}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className={linkClass}
        aria-label="Próxima página"
      >
        Próxima
        <ChevronRight />
      </button>
    </nav>
  );
}
