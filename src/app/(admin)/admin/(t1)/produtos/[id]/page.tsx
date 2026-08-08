export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
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
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        art: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { subcategories: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Package size={13} />
            <span>Gestão de Catálogo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Editar produto
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Edite os dados de{" "}
            <span className="font-semibold text-foreground">{product.name}</span>.
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href="/admin/produtos" />}
          className="gap-2 self-start shrink-0 sm:self-auto"
        >
          <ArrowLeft size={16} />
          Voltar à listagem
        </Button>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
