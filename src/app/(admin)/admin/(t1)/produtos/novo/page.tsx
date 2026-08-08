export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { ProductForm } from "../_components/ProductForm";

export const metadata: Metadata = { title: "Novo Produto — Admin" };

export default async function NovoProdutoPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { subcategories: { orderBy: { sortOrder: "asc" } } },
  });

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
            Novo produto
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Preencha os dados do produto para adicioná-lo ao catálogo.
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

      <ProductForm categories={categories} />
    </div>
  );
}
