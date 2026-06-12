import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryRow } from "./_components/CategoryRow";

export const metadata: Metadata = { title: "Categorias — Admin" };

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Categorias</h1>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Produtos</th>
              <th className="text-left px-4 py-3 font-medium">Ordem</th>
              <th className="text-left px-4 py-3 font-medium">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
