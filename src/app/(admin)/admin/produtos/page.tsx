export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { AnimatedTableRows } from "./_components/AnimatedTableRows";

export const metadata: Metadata = { title: "Produtos — Admin" };

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      category: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado
            {products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button render={<Link href="/admin/produtos/novo" />} className="gap-2">
          <Plus size={16} />
          Novo produto
        </Button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-12" />
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Nome
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Categoria
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Destaque
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider" />
            </tr>
          </thead>
          <AnimatedTableRows products={products} />
        </table>

        {products.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Package size={32} className="opacity-30" />
              <p className="text-sm">Nenhum produto cadastrado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
