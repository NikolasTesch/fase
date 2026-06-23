"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Shirt } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

interface ModalityLineItem {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
}

interface ModalitySection {
  title: string;
  subtitle?: string;
  lines: ModalityLineItem[];
  catalogLinks?: { label: string; href: string }[];
}

interface CategoryItemData {
  id: string;
  lineId: string;
  sectionTitle: string;
  sectionSubtitle: string | null;
  sectionOrder: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  catalogLinkLabel: string | null;
  catalogLinkHref: string | null;
}

function buildSections(items: CategoryItemData[]): ModalitySection[] {
  const map = new Map<
    string,
    { title: string; subtitle?: string; order: number; lines: ModalityLineItem[] }
  >();

  for (const item of items) {
    if (!map.has(item.sectionTitle)) {
      map.set(item.sectionTitle, {
        title: item.sectionTitle,
        subtitle: item.sectionSubtitle ?? undefined,
        order: item.sectionOrder,
        lines: [],
      });
    }
    map.get(item.sectionTitle)!.lines.push({
      id: item.lineId,
      name: item.name,
      imageUrl: item.imageUrl,
      description: item.description,
    });
  }

  const sections: ModalitySection[] = [];
  for (const [, value] of map) {
    const section: ModalitySection = {
      title: value.title,
      subtitle: value.subtitle,
      lines: value.lines,
    };

    const hasLinks = items.some(
      (i) =>
        i.sectionTitle === value.title &&
        i.catalogLinkLabel &&
        i.catalogLinkHref
    );
    if (hasLinks) {
      section.catalogLinks = items
        .filter(
          (i) =>
            i.sectionTitle === value.title &&
            i.catalogLinkLabel &&
            i.catalogLinkHref
        )
        .map((i) => ({
          label: i.catalogLinkLabel!,
          href: i.catalogLinkHref!,
        }));
    }

    sections.push(section);
  }

  sections.sort((a, b) => {
    const aOrder = items.find((i) => i.sectionTitle === a.title)?.sectionOrder ?? 0;
    const bOrder = items.find((i) => i.sectionTitle === b.title)?.sectionOrder ?? 0;
    return aOrder - bOrder;
  });

  return sections;
}

interface ModalitySectionBlockProps {
  section: ModalitySection;
}

function ModalitySectionBlock({ section }: ModalitySectionBlockProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((i) => (i - 1 + section.lines.length) % section.lines.length);
  const next = () => setActiveIdx((i) => (i + 1) % section.lines.length);

  const active = section.lines[activeIdx];

  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2 lg:items-center">
      {/* Info panel */}
      <div className="flex flex-col gap-4 lg:order-1">
        <div>
          <h3 className="font-heading text-3xl text-foreground">{section.title}</h3>
          {section.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {active.name}
          </p>
          <p className="mt-1 text-muted-foreground">{active.description}</p>
        </div>

        {/* Line selector dots */}
        <div className="flex gap-2">
          {section.lines.map((line, i) => (
            <button
              key={line.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Ver ${line.name}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

        {/* Catalog links */}
        {section.catalogLinks ? (
          <div className="flex flex-wrap gap-2">
            {section.catalogLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {/* Image carousel */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted lg:order-2">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <Shirt className="size-16 text-primary/30" aria-hidden="true" />
          </div>
          {active.imageUrl ? (
            <Image
              key={active.id}
              src={active.imageUrl}
              alt={active.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Shirt className="size-12 text-primary/20" />
            </div>
          )}
        </div>

        {section.lines.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Linha anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima linha"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface CategoriesSectionProps {
  items: CategoryItemData[];
}

export function CategoriesSection({ items }: CategoriesSectionProps) {
  const sections = useMemo(() => buildSections(items), [items]);

  return (
    <section id="categorias" className="bg-background py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Modalidades
          </h2>
          <p className="mt-3 text-muted-foreground">
            Explore as linhas de cada categoria e encontre o uniforme ideal para
            o seu time.
          </p>
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
