export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SizeTableRow } from "./_components/SizeTableRow";
import { Ruler } from "lucide-react";

export const metadata: Metadata = { title: "Tabela de Tamanhos — Admin" };

export default async function TamanhosPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      sizeTableUrl: true,
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tabela de Tamanhos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {categories.length} categoria{categories.length !== 1 ? "s" : ""} —
            Faça upload da imagem da tabela de tamanhos de cada categoria
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Categoria
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Slug
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Tabela de Tamanhos
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <SizeTableRow key={cat.id} category={cat} index={i} />
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Ruler size={32} className="opacity-30" />
              <p className="text-sm">Nenhuma categoria cadastrada.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
