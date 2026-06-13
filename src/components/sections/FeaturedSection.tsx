import { ProductCard } from "@/components/products/ProductCard";
import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

interface FeaturedProduct {
  slug: string;
  name: string;
  fabric: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  categorySlug: string;
}

interface FeaturedSectionProps {
  products: FeaturedProduct[];
}

export function FeaturedSection({ products }: FeaturedSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Destaques da Semana
          </h2>
          <p className="mt-3 text-muted-foreground">
            Modelos selecionados para inspirar o próximo uniforme do seu time.
          </p>
        </RevealOnScroll>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product, index) => (
            <RevealOnScroll key={product.slug} delay={index * 0.05}>
              <ProductCard
                slug={product.slug}
                name={product.name}
                categorySlug={product.categorySlug}
                fabric={product.fabric}
                imageUrl={product.imageUrl}
                imageAlt={product.imageAlt}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
