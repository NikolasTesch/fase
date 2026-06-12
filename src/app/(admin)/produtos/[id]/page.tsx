import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "../_components/ProductForm";

export const metadata: Metadata = { title: "Editar Produto — Admin" };

interface Params {
  params: Promise<{ id: string }>;
}

export default async function EditarProdutoPage({ params }: Params) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { subcategories: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Editar produto</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
