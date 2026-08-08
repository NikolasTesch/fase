"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shirt } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

export interface ModalityLineItem {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  catalogLinkLabel: string | null;
  catalogLinkHref: string | null;
}

export interface ModalitySection {
  title: string;
  subtitle?: string | null;
  lines: ModalityLineItem[];
}

interface ModalitySectionBlockProps {
  section: ModalitySection;
}

import { GlassCard } from "@/components/ui/GlassCard";

function ModalitySectionBlock({ section }: ModalitySectionBlockProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const prev = () => setActiveIdx((i) => (i - 1 + section.lines.length) % section.lines.length);
  const next = () => setActiveIdx((i) => (i + 1) % section.lines.length);

  const active = section.lines[activeIdx];

  const catalogLinks = section.lines
    .filter((l) => l.catalogLinkLabel && l.catalogLinkHref)
    .map((l) => ({ label: l.catalogLinkLabel!, href: l.catalogLinkHref! }));

  const hasImageError = active?.id ? imgErrors[active.id] : false;

  return (
    <GlassCard hoverGlow className="grid gap-6 p-6 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col gap-5 lg:order-1">
        <div>
          <h3 className="font-heading text-3xl font-bold text-foreground">{section.title}</h3>
          {section.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">{active.name}</p>
          {active.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{active.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
          {section.lines.map((line, i) => (
            <button
              key={line.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Ver ${line.name}`}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === activeIdx ? "32px" : "10px" }}
            >
              <div
                className={`h-full w-full rounded-full transition-colors duration-300 ${
                  i === activeIdx ? "bg-accent" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
              />
            </button>
          ))}
        </div>
        {catalogLinks.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {catalogLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-accent/15 hover:border-accent hover:text-accent shadow-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-brand-dark/15 to-black/20 lg:order-2">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <Shirt className="size-16 text-accent/20" aria-hidden="true" />
          </div>
          <AnimatePresence mode="wait">
            {active.imageUrl && !hasImageError && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={active.imageUrl}
                  alt={active.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  onError={() => setImgErrors((prev) => ({ ...prev, [active.id]: true }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {section.lines.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Linha anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md transition-transform hover:scale-110 hover:bg-background"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima linha"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md transition-transform hover:scale-110 hover:bg-background"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>
    </GlassCard>
  );
}

interface CategoriesSectionProps {
  sections: ModalitySection[];
}

export function CategoriesSection({ sections }: CategoriesSectionProps) {
  return (
    <section id="categorias" className="bg-background border-t border-border/60 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">Modalidades</h2>
          <p className="mt-3 text-muted-foreground">Explore as linhas de cada categoria e encontre o uniforme ideal para o seu time.</p>
        </RevealOnScroll>
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <ModalitySectionBlock key={section.title} section={section} />
          ))}
        </div>
      </div>
    </section>
  );
}
