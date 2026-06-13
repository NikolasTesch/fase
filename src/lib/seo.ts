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
