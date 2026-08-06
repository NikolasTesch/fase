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
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col gap-4 lg:order-1">
        <div>
          <h3 className="font-heading text-3xl text-foreground">{section.title}</h3>
          {section.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">{active.name}</p>
          {active.description && (
            <p className="mt-1 text-muted-foreground">{active.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {section.lines.map((line, i) => (
            <button key={line.id} type="button" onClick={() => setActiveIdx(i)} aria-label={`Ver ${line.name}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === activeIdx ? "w-6 bg-accent" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
            />
          ))}
        </div>
        {catalogLinks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {catalogLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="rounded-lg border border-accent/30 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
              >{link.label}</Link>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-brand-dark/10 lg:order-2">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <Shirt className="size-16 text-accent/15" aria-hidden="true" />
          </div>
          <AnimatePresence mode="wait">
            {active.imageUrl && !hasImageError && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image src={active.imageUrl} alt={active.name} fill
                  sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover"
                  onError={() => setImgErrors((prev) => ({ ...prev, [active.id]: true }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {section.lines.length > 1 ? (
          <>
            <button type="button" onClick={prev} aria-label="Linha anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"
            ><ChevronLeft className="size-4" /></button>
            <button type="button" onClick={next} aria-label="Próxima linha"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"
            ><ChevronRight className="size-4" /></button>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface CategoriesSectionProps {
  sections: ModalitySection[];
}

export function CategoriesSection({ sections }: CategoriesSectionProps) {
  return (
    <section id="categorias" className="bg-background py-16 lg:py-24">
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
