export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { FileDown, Package } from "lucide-react";
import { ArtesGrid } from "./_components/ArtesGrid";

export const metadata: Metadata = { title: "Artes — Admin Fase Sport" };

export default async function ArtesPage() {
  const products = await prisma.product.findMany({
    where: { art: { isNot: null } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      category: { select: { name: true } },
      art: {
        select: {
          id: true,
          name: true,
          previewUrl: true,
          previewMimeType: true,
          originalFileName: true,
          originalMimeType: true,
          sizeBytes: true,
        },
      },
    },
  });

  const artes = products
    .filter((p) => p.art !== null)
    .map((p) => ({ ...p, art: p.art! }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <FileDown size={13} />
            <span>Biblioteca de Artes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Artes
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Produtos com arte atrelada — baixe os arquivos originais (CDR/SVG/PDF...)
          </p>
        </div>
        <Button variant="default" render={<Link href="/admin/produtos" />} className="gap-2 shrink-0 shadow-md shadow-primary/20">
          <Package size={16} />
          Ir para Produtos
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        {artes.length > 0 ? (
          <div className="p-4 sm:p-5">
            <ArtesGrid artes={artes} />
          </div>
        ) : (
          <div className="px-4 py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                <FileDown size={24} className="opacity-40" />
              </div>
              <p className="text-sm font-medium">Nenhum produto possui arte atrelada.</p>
              <Button variant="default" size="sm" render={<Link href="/admin/produtos" />} className="gap-2 mt-1">
                <Package size={14} />
                Gerenciar produtos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
