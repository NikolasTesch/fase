export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CategoryWhatsAppCta } from "@/components/products/CategoryWhatsAppCta";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryHero } from "@/components/sections/CategoryHero";
import { DiferenciaisEmpresariais } from "@/components/sections/DiferenciaisEmpresariais";
import { SegmentosEmpresariais } from "@/components/sections/SegmentosEmpresariais";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { buildWhatsAppUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Uniformes Empresariais Personalizados | Fase Sport",
  description:
    "Fardamento corporativo sob medida para empresas em Teixeira de Freitas-BA. Polos, camisas sociais, uniformes operacionais e kits de eventos com bordado, silk ou sublimação.",
};

const getEmpresarialData = (sub?: string) =>
  unstable_cache(
    async () => {
      const data = await prisma.category.findUnique({
        where: { slug: "empresarial" },
        include: {
          subcategories: { orderBy: { sortOrder: "asc" } },
          products: {
            where: {
              isActive: true,
              ...(sub ? { subcategory: { slug: sub } } : {}),
            },
            include: { images: { where: { isPrimary: true }, take: 1 } },
            orderBy: { sortOrder: "asc" },
          },
        },
      });
      if (!data) {
        throw new Error("Category 'empresarial' not found in database");
      }
      return data;
    },
    [`empresarial-${sub ?? "all"}`],
    { revalidate: 3600, tags: ["category-empresarial"] }
  )();

interface EmpresarialPageProps {
  searchParams: Promise<{ sub?: string }>;
}

export default async function EmpresarialPage({
  searchParams,
}: EmpresarialPageProps) {
  const { sub } = await searchParams;

  console.log("LOG: executing empresarial page", { sub });

  try {
    const category = await getEmpresarialData(sub);

    console.log("LOG: category found on page:", category ? "YES" : "NO", JSON.stringify(category));

    if (!category || !category.isActive) {
      notFound();
    }

    const products = category.products.map((product) => {
      const primaryImage = product.images[0];
      return {
        slug: product.slug,
        name: product.name,
        categorySlug: "empresarial",
        fabric: product.fabric,
        imageUrl: primaryImage?.url ?? null,
        imageAlt: primaryImage?.altText ?? null,
      };
    });

    const whatsAppUrl = buildWhatsAppUrl(
      "Olá Fase Sport! Quero saber mais sobre uniformes empresariais para minha empresa."
    );

    const heroImageUrl =
      category.imageUrl || `/images/categories/empresarial-hero.jpg`;

    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 lg:py-12">
        <Breadcrumb
          items={[
            { label: "Início", href: "/" },
            { label: "Empresarial" },
          ]}
        />

        <CategoryHero
          name="Uniformes Empresariais"
          description="Fardamento corporativo personalizado para equipes administrativas, operacionais e eventos — bordado, silk ou sublimação com identidade visual da sua empresa."
          imageUrl={heroImageUrl}
        />

        <SegmentosEmpresariais activeSub={sub} />

        <section>
          <h2 className="mb-4 font-heading text-2xl font-extrabold uppercase tracking-tight text-foreground">
            {sub
              ? (category.subcategories.find((s) => s.slug === sub)?.name ?? "Produtos")
              : "Todos os Modelos"}
          </h2>
          <ProductGrid products={products} />
        </section>

        <DiferenciaisEmpresariais />

        <section className="flex flex-col items-start gap-4 rounded-2xl bg-muted px-6 py-10 sm:items-center sm:text-center lg:px-10">
          <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-foreground lg:text-4xl">
            Vamos uniformizar sua equipe?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Solicite um orçamento sem compromisso. Atendemos empresas de qualquer porte com prazo e qualidade garantidos.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={<Link href="/orcamento?sport=empresarial" />}
            >
              Solicitar Orçamento
            </Button>
            <CategoryWhatsAppCta url={whatsAppUrl} />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Error loading empresarial page:", error);
    notFound();
  }
}
