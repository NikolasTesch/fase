"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface TestimonialItem {
  id: string;
  name: string;
  role?: string | null;
  content: string;
  rating?: number | null;
  materialImageUrl?: string | null;
}

interface TestimonialsCarouselProps {
  testimonials: TestimonialItem[];
}

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const shouldReduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setIndex((next + testimonials.length) % testimonials.length);
    },
    [testimonials.length]
  );

  const prev = useCallback(() => go(index - 1, -1), [go, index]);
  const next = useCallback(() => go(index + 1, 1), [go, index]);

  useEffect(() => {
    if (paused || shouldReduce || testimonials.length <= 1) return;
    intervalRef.current = setInterval(() => go(index + 1, 1), 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index, paused, shouldReduce, testimonials.length, go]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) next();
    else if (info.offset.x > 80) prev();
  };

  if (testimonials.length === 0) return null;

  const current = testimonials[index];

  return (
    <section
      className="bg-background py-16 lg:py-24"
      aria-roledescription="carrossel"
      aria-label="Depoimentos de clientes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Depoimentos
          </p>
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            O que dizem nossos times
          </h2>
          <p className="mt-3 text-muted-foreground">
            A confiança de quem já vestiu a camisa da Fase Sport.
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={shouldReduce ? undefined : variants}
              initial={shouldReduce ? false : "enter"}
              animate="center"
              exit={shouldReduce ? undefined : "exit"}
              transition={{ duration: 0.35, ease: "easeOut" }}
              drag={shouldReduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              aria-live="polite"
              className="grid gap-6 lg:grid-cols-2 lg:items-center"
            >
              {/* Material image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted lg:aspect-[4/3]">
                {current.materialImageUrl ? (
                  <Image
                    src={current.materialImageUrl}
                    alt={`Uniforme entregue para ${current.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <span className="font-heading text-6xl font-bold text-primary/30">
                      FASE
                    </span>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-5">
                {typeof current.rating === "number" ? (
                  <div
                    className="flex gap-0.5 text-primary"
                    aria-label={`Avaliação ${current.rating} de 5`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-5",
                          i < current.rating! ? "fill-current" : "text-muted-foreground/30"
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                ) : null}

                <blockquote className="text-xl leading-relaxed text-foreground">
                  &ldquo;{current.content}&rdquo;
                </blockquote>

                <figcaption>
                  <span className="block font-semibold text-foreground">
                    {current.name}
                  </span>
                  {current.role ? (
                    <span className="block text-sm text-muted-foreground">
                      {current.role}
                    </span>
                  ) : null}
                </figcaption>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop prev/next */}
          {testimonials.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Depoimento anterior"
                className="absolute -left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background p-2 shadow-md transition-colors hover:bg-muted lg:flex"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Próximo depoimento"
                className="absolute -right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background p-2 shadow-md transition-colors hover:bg-muted lg:flex"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        {/* Dots */}
        {testimonials.length > 1 ? (
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go(i, i > index ? 1 : -1)}
                aria-label={`Ir para depoimento ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index
                    ? "w-6 bg-primary"
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
