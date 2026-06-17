export const revalidate = 3600;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductWhatsAppCta } from "@/components/products/ProductWhatsAppCta";
import { ProductSpecifications } from "@/components/products/ProductSpecifications";
import { LinesAndProcessSection } from "@/components/products/LinesAndProcessSection";
import { SimulatorCta } from "@/components/products/SimulatorCta";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo";
import { getSimulatorUrl } from "@/lib/site";

interface ProductPageProps {
  params: Promise<{ categoria: string; produto: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; produto: string }>;
}): Promise<Metadata> {
  const { produto } = await params;
  const product = await prisma.product.findUnique({
    where: { slug: produto },
    select: { name: true, seoTitle: true, seoDesc: true },
  });

  if (!product) {
    return {};
  }

  return {
    title: product.seoTitle ?? `${product.name} | Fase Sport`,
    description:
      product.seoDesc ??
      `Uniforme ${product.name} personalizado. Solicite seu orçamento.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { categoria, produto } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: produto },
    select: {
      slug: true,
      name: true,
      description: true,
      fabric: true,
      minQty: true,
      isActive: true,
      simulatorUrl: true,
      seoTitle: true,
      seoDesc: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { url: true, altText: true },
      },
      category: { select: { slug: true, name: true } },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  if (product.category.slug !== categoria) {
    notFound();
  }

  const { category } = product;
  const primaryImage = product.images[0];
  const simulatorUrl = getSimulatorUrl(product.simulatorUrl);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Início", href: "/" },
    { name: category.name, href: `/${category.slug}` },
    { name: product.name },
  ]);
  const productJsonLd = buildProductJsonLd({
    name: product.name,
    description: product.description,
    image: primaryImage?.url,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: category.name, href: `/${category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-6">
          <h1 className="font-heading text-4xl text-foreground">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            {product.fabric ? (
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
                {product.fabric}
              </span>
            ) : null}
            <span className="text-sm text-muted-foreground">
              Quantidade mínima: {product.minQty} unidades
            </span>
          </div>

          {product.description ? (
            <p className="text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <ProductWhatsAppCta
              productName={product.name}
              categoryName={category.name}
            />
            <Button
              size="lg"
              variant="outline"
              render={
                <Link
                  href={`/orcamento?produto=${product.slug}&sport=${category.slug}`}
                />
              }
            >
              Solicitar Orçamento
            </Button>
          </div>

          {simulatorUrl ? (
            <SimulatorCta url={simulatorUrl} productSlug={product.slug} />
          ) : null}

          <ProductSpecifications
            categorySlug={category.slug}
            fabric={product.fabric}
            minQty={product.minQty}
          />
        </div>
      </div>

      <LinesAndProcessSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </div>
  );
}
