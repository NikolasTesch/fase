export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryRow } from "./_components/CategoryRow";
import { Tag } from "lucide-react";

export const metadata: Metadata = { title: "Categorias — Admin" };

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {categories.length} categoria{categories.length !== 1 ? "s" : ""} de esporte
        </p>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-20">
                Imagem
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Nome
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Slug
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Produtos
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Ordem
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <CategoryRow key={cat.id} category={cat} index={i} />
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Tag size={32} className="opacity-30" />
              <p className="text-sm">Nenhuma categoria cadastrada.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
