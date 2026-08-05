export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Package, Layers } from "lucide-react";
import { AnimatedTableRows } from "./_components/AnimatedTableRows";

export const metadata: Metadata = { title: "Produtos — Admin Fase Sport" };

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      category: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers size={13} />
            <span>Gestão de Catálogo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Produtos
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Total de <span className="font-semibold text-foreground">{products.length}</span> produto{products.length !== 1 ? "s" : ""} no catálogo
          </p>
        </div>
        <Button variant="accent" render={<Link href="/admin/produtos/novo" />} className="gap-2 shrink-0 shadow-md shadow-accent/20">
          <Plus size={16} />
          Novo Produto
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border/80">
            <tr>
              <th className="text-left px-5 py-3.5 font-bold text-muted-foreground text-xs uppercase tracking-wider w-14" />
              <th className="text-left px-4 py-3.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Nome do Produto
              </th>
              <th className="text-left px-4 py-3.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Categoria
              </th>
              <th className="text-left px-4 py-3.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Destaque
              </th>
              <th className="text-left px-4 py-3.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3.5 font-bold text-muted-foreground text-xs uppercase tracking-wider" />
            </tr>
          </thead>
          <AnimatedTableRows products={products} />
        </table>

        {products.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Package size={24} className="opacity-40" />
              </div>
              <p className="text-sm font-medium">Nenhum produto cadastrado até o momento.</p>
              <Button variant="accent" size="sm" render={<Link href="/admin/produtos/novo" />} className="gap-2 mt-1">
                <Plus size={14} />
                Cadastrar primeiro produto
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
