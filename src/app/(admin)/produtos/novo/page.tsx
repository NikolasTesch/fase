import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductForm } from "../_components/ProductForm";

export const metadata: Metadata = { title: "Novo Produto — Admin" };

export default async function NovoProdutoPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { subcategories: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
