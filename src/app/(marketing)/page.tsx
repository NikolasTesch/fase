export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { FeaturedSection } from "@/components/sections/FeaturedSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { WhySection } from "@/components/sections/WhySection";
import { CtaBannerSection } from "@/components/sections/CtaBannerSection";

async function getHomepageData() {
  try {
    const [categories, featuredProducts, testimonials] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 4,
        orderBy: { sortOrder: "asc" },
        select: {
          slug: true,
          name: true,
          fabric: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altText: true },
          },
          category: { select: { slug: true, name: true } },
        },
      }),
      prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return { categories, featuredProducts, testimonials };
  } catch (error) {
    console.error("[GET /]", error);
    return { categories: [], featuredProducts: [], testimonials: [] };
  }
}

export default async function HomePage() {
  const { categories, featuredProducts, testimonials } =
    await getHomepageData();

  const categoryItems = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    imageUrl: category.imageUrl,
  }));

  const featuredItems = featuredProducts.map((product) => ({
    slug: product.slug,
    name: product.name,
    fabric: product.fabric,
    imageUrl: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.altText ?? null,
    categorySlug: product.category.slug,
  }));

  const testimonialItems = testimonials.map((testimonial) => ({
    id: testimonial.id,
    name: testimonial.clientName,
    role: testimonial.teamName ?? testimonial.sport,
    content: testimonial.text,
    rating: testimonial.rating,
  }));

  return (
    <>
      <HeroSection />
      <CategoriesSection categories={categoryItems} />
      <FeaturedSection products={featuredItems} />
      <HowItWorksSection />
      <TestimonialsSection testimonials={testimonialItems} />
      <WhySection />
      <CtaBannerSection />
    </>
  );
}
