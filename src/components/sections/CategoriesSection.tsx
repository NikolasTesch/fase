import { CategoryCard } from "@/components/categories/CategoryCard";
import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import { StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";

interface CategoriesSectionProps {
  categories: { slug: string; name: string; imageUrl: string | null }[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section id="categorias" className="bg-background py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Modalidades
          </h2>
          <p className="mt-3 text-muted-foreground">
            Escolha a sua categoria e descubra os modelos disponíveis para
            personalização.
          </p>
        </RevealOnScroll>
        <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <StaggerItem key={category.slug}>
              <CategoryCard
                slug={category.slug}
                name={category.name}
                imageUrl={category.imageUrl}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
