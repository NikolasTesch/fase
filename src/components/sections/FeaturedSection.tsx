"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";

import { ProductCard } from "@/components/products/ProductCard";
import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import { cn } from "@/lib/utils";

interface FeaturedProduct {
  slug: string;
  name: string;
  fabric: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  categorySlug: string;
  categoryName?: string | null;
  minQty?: number | null;
}

interface FeaturedSectionProps {
  products: FeaturedProduct[];
}

function useItemsPerPage() {
  const [items, setItems] = useState(4);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setItems(4);
      else if (window.innerWidth >= 768) setItems(2);
      else setItems(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return items;
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  const itemsPerPage = useItemsPerPage();
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shouldReduce = useReducedMotion();

  const goTo = useCallback(
    (next: number) => setPage((next + totalPages) % totalPages),
    [totalPages]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x < -60) goTo(page + 1);
      else if (info.offset.x > 60) goTo(page - 1);
    },
    [goTo, page]
  );

  useEffect(() => {
    if (paused || totalPages <= 1) return;
    intervalRef.current = setInterval(() => goTo(page + 1), 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [page, paused, totalPages, goTo]);

  if (products.length === 0) return null;

  const start = page * itemsPerPage;
  const visible = products.slice(start, start + itemsPerPage);

  const showControls = totalPages > 1;

  return (
    <section
      className="bg-muted py-16 lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Destaques da Semana
          </h2>
          <p className="mt-3 text-muted-foreground">
            Modelos selecionados para inspirar o próximo uniforme do seu time.
          </p>
        </RevealOnScroll>

        <div className="relative">
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            drag={shouldReduce || totalPages <= 1 ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {visible.map((product) => (
              <ProductCard
                key={product.slug}
                slug={product.slug}
                name={product.name}
                categorySlug={product.categorySlug}
                categoryName={product.categoryName}
                minQty={product.minQty}
                fabric={product.fabric}
                imageUrl={product.imageUrl}
                imageAlt={product.imageAlt}
              />
            ))}
          </motion.div>

          {showControls ? (
            <>
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                aria-label="Anterior"
                className="absolute -left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background p-2 shadow-md transition-colors hover:bg-muted lg:flex"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(page + 1)}
                aria-label="Próximo"
                className="absolute -right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background p-2 shadow-md transition-colors hover:bg-muted lg:flex"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        {showControls ? (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Página ${i + 1}`}
                aria-current={i === page ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === page
                    ? "w-6 bg-accent"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
