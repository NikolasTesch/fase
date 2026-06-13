import { SITE_CONTACT } from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Fase Sport",
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.svg`,
    telephone: SITE_CONTACT.whatsapp,
    email: SITE_CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Colatina",
      addressRegion: "ES",
      addressCountry: "BR",
      streetAddress: SITE_CONTACT.address,
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; href?: string }[]
) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://fasesport.com.br";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${base}${item.href}` } : {}),
    })),
  };
}

export function buildProductJsonLd(product: {
  name: string;
  description?: string | null;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.image ? { image: product.image } : {}),
    brand: { "@type": "Brand", name: "Fase Sport" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Fase Sport" },
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        description: "Preço sob consulta — solicite orçamento",
      },
    },
  };
}

export function buildFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
