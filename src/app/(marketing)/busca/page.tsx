export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: BuscaPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q
      ? `Resultados para "${q}" | Fase Sport`
      : "Busca de Produtos | Fase Sport",
    description: q
      ? `Uniformes esportivos que correspondem a "${q}" na Fase Sport.`
      : "Busque modelos de uniformes esportivos personalizados na Fase Sport.",
  };
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  const rawProducts = term
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        orderBy: { sortOrder: "asc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { slug: true } },
        },
      })
    : [];

  const products = rawProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    categorySlug: p.category.slug,
    fabric: p.fabric,
    imageUrl: p.images[0]?.url ?? null,
    imageAlt: p.images[0]?.altText ?? null,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: term ? `Busca: "${term}"` : "Busca" },
        ]}
      />

      <header>
        <h1 className="font-heading text-3xl text-foreground lg:text-4xl">
          {term ? (
            <>
              Resultados para:{" "}
              <span className="text-primary">&ldquo;{term}&rdquo;</span>
            </>
          ) : (
            "Busca de Produtos"
          )}
        </h1>
        {term && products.length > 0 && (
          <p className="mt-2 text-muted-foreground">
            {products.length} {products.length === 1 ? "modelo encontrado" : "modelos encontrados"}
          </p>
        )}
      </header>

      {!term ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
          <p className="text-base font-medium text-foreground">
            Digite um termo para buscar modelos
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o campo de busca no menu para encontrar o uniforme ideal.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
          <p className="text-base font-medium text-foreground">
            Nenhum modelo encontrado para &ldquo;{term}&rdquo;
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente outro termo ou explore o catálogo completo.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline" render={<Link href="/" />}>
              Voltar ao catálogo
            </Button>
            <Button render={<Link href="/orcamento" />}>
              Solicitar Orçamento
            </Button>
          </div>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
