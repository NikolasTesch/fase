export const revalidate = 3600;

import { prisma } from "@/lib/db";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { FeaturedSection } from "@/components/sections/FeaturedSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WhySection } from "@/components/sections/WhySection";
import { TestimonialsCarousel } from "@/components/sections/TestimonialsCarousel";
import { CustomizationCtaSection } from "@/components/sections/CustomizationCtaSection";
import { UniformsCarouselSection } from "@/components/sections/UniformsCarouselSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { CtaBannerSection } from "@/components/sections/CtaBannerSection";
import { InstagramSection } from "@/components/sections/InstagramSection";

async function getHomepageData() {
  try {
      const [featuredProducts, testimonials, instagramPosts, heroVideoSetting, modalityItems] =
        await Promise.all([
          prisma.product.findMany({
            where: { isActive: true, isFeatured: true },
            take: 16,
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
          prisma.instagramPost.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            take: 6,
          }),
          prisma.siteSetting.findUnique({
            where: { key: "instagram_hero_video_url" },
          }),
          prisma.modalityItem.findMany({
            where: { isActive: true },
            orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
          }),
        ]);

      return { featuredProducts, testimonials, instagramPosts, heroVideoSetting, modalityItems };
  } catch (error) {
    console.error("[GET /]", error);
    return {
      featuredProducts: [],
      testimonials: [],
      instagramPosts: [],
      heroVideoSetting: null,
      modalityItems: [],
    };
  }
}

export default async function HomePage() {
  const { featuredProducts, testimonials, instagramPosts, heroVideoSetting, modalityItems } =
    await getHomepageData();

  type RawItem = (typeof modalityItems)[number];
  const modalitySections = modalityItems.reduce<
    { title: string; subtitle: string | null; order: number; lines: RawItem[] }[]
  >((acc, item) => {
    const existing = acc.find((s) => s.title === item.sectionTitle);
    if (existing) {
      existing.lines.push(item);
    } else {
      acc.push({ title: item.sectionTitle, subtitle: item.sectionSubtitle, order: item.sectionOrder, lines: [item] });
    }
    return acc;
  }, []).sort((a, b) => a.order - b.order);

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
    materialImageUrl: testimonial.materialImageUrl,
  }));

  const instagramItems = instagramPosts.map((post) => ({
    id: post.id,
    imageUrl: post.imageUrl,
    linkUrl: post.linkUrl,
    caption: post.caption,
  }));

  const videoUrl = heroVideoSetting?.value ?? null;

  return (
    <>
      <HeroSection />
      <CategoriesSection sections={modalitySections} />
      <FeaturedSection products={featuredItems} />
      <HowItWorksSection />
      <WhySection />
      <TestimonialsCarousel testimonials={testimonialItems} />
      <CustomizationCtaSection />
      <UniformsCarouselSection uniforms={featuredItems} />
      <ContactSection />
      <CtaBannerSection />
      <InstagramSection
        posts={instagramItems}
        videoUrl={videoUrl}
      />
    </>
  );
}
