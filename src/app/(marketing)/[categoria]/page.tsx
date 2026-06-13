import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SubcategoryFilter } from "@/components/products/SubcategoryFilter";
import { CategoryHero } from "@/components/sections/CategoryHero";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { buildWhatsAppUrl } from "@/lib/site";

interface CategoryPageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return categories.map((category) => ({ categoria: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const category = await prisma.category.findUnique({
    where: { slug: categoria },
    select: { name: true, seoTitle: true, seoDesc: true },
  });

  if (!category) {
    return {};
  }

  return {
    title:
      category.seoTitle ??
      `Uniformes de ${category.name} Personalizados | Fase Sport`,
    description:
      category.seoDesc ??
      `Confira os uniformes de ${category.name} da Fase Sport`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { categoria } = await params;
  const { sub } = await searchParams;

  const category = await prisma.category.findUnique({
    where: { slug: categoria },
    include: {
      subcategories: {
        orderBy: { sortOrder: "asc" },
      },
      products: {
        where: {
          isActive: true,
          ...(sub ? { subcategory: { slug: sub } } : {}),
        },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  const products = category.products.map((product) => {
    const primaryImage = product.images[0];
    return {
      slug: product.slug,
      name: product.name,
      categorySlug: category.slug,
      fabric: product.fabric,
      imageUrl: primaryImage?.url ?? null,
      imageAlt: primaryImage?.altText ?? null,
    };
  });

  const whatsAppUrl = buildWhatsAppUrl(
    `Olá Fase Sport! Quero uniforme de ${category.name}.`
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: category.name },
        ]}
      />

      <CategoryHero
        name={category.name}
        description={category.description}
        imageUrl={category.imageUrl}
      />

      {category.subcategories.length > 0 ? (
        <SubcategoryFilter
          subcategories={category.subcategories.map((subcategory) => ({
            slug: subcategory.slug,
            name: subcategory.name,
          }))}
          activeSlug={sub}
        />
      ) : null}

      <ProductGrid products={products} />

      <section className="flex flex-col items-start gap-4 rounded-2xl bg-muted px-6 py-10 sm:items-center sm:text-center lg:px-10">
        <h2 className="font-heading text-3xl text-foreground lg:text-4xl">
          Pronto para o uniforme do seu time?
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Solicite um orçamento sem compromisso ou fale direto com a Fase Sport
          pelo WhatsApp.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            render={<Link href={`/orcamento?sport=${category.slug}`} />}
          >
            Solicitar Orçamento
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            Chamar no WhatsApp
          </Button>
        </div>
      </section>
    </div>
  );
}
