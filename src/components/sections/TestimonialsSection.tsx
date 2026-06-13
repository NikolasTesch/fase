"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role?: string | null;
  content: string;
  rating?: number | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            O que dizem nossos times
          </h2>
          <p className="mt-3 text-muted-foreground">
            A confiança de quem já vestiu a camisa da Fase Sport.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.id}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: index * 0.05,
              }}
            >
              {typeof testimonial.rating === "number" ? (
                <div
                  className="flex gap-0.5 text-primary"
                  aria-label={`Avaliação ${testimonial.rating} de 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < testimonial.rating!
                          ? "fill-current"
                          : "text-muted-foreground/40",
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : null}
              <blockquote className="text-card-foreground">
                {testimonial.content}
              </blockquote>
              <figcaption className="mt-auto">
                <span className="block font-medium text-foreground">
                  {testimonial.name}
                </span>
                {testimonial.role ? (
                  <span className="block text-sm text-muted-foreground">
                    {testimonial.role}
                  </span>
                ) : null}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
