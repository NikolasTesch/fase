export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ModalitySectionCard } from "./_components/ModalitySectionCard";
import { Shirt } from "lucide-react";

export const metadata: Metadata = { title: "Modalidades — Admin" };

export default async function ModalidadesPage() {
  const items = await prisma.modalityItem.findMany({
    orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
  });

  const sections = items.reduce<
    { title: string; subtitle: string | null; order: number; items: typeof items }[]
  >((acc, item) => {
    const existing = acc.find((s) => s.title === item.sectionTitle);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({
        title: item.sectionTitle,
        subtitle: item.sectionSubtitle,
        order: item.sectionOrder,
        items: [item],
      });
    }
    return acc;
  }, []);

  sections.sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Fotos das Modalidades
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie as imagens exibidas na seção &ldquo;Modalidades&rdquo; da
          página principal
        </p>
      </div>

      {sections.length === 0 && (
        <div className="rounded-2xl border border-border px-4 py-16 text-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Shirt size={32} className="opacity-30" />
            <p className="text-sm">
              Nenhum item de modalidade encontrado. Execute o seed.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <ModalitySectionCard
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
            items={section.items}
          />
        ))}
      </div>
    </div>
  );
}
