export interface CategoryNavItem {
  slug: string;
  label: string;
}

export const CATEGORY_NAV: CategoryNavItem[] = [
  { slug: "futebol", label: "Futebol" },
  { slug: "volei", label: "Vôlei" },
  { slug: "basquete", label: "Basquete" },
  { slug: "handebol", label: "Handebol" },
  { slug: "passeio", label: "Passeio" },
  { slug: "agasalho", label: "Agasalho" },
  { slug: "colete", label: "Colete" },
  { slug: "acessorios", label: "Acessórios" },
];

export const SITE_CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  email: "contato@fasesport.com.br",
  address: "Colatina-ES",
  city: "Colatina-ES",
} as const;

const DEFAULT_WHATSAPP_MESSAGE =
  "Olá Fase Sport! Gostaria de solicitar um orçamento.";

export function buildWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  if (!number && process.env.NODE_ENV === "development") {
    console.warn(
      "[buildWhatsAppUrl] NEXT_PUBLIC_WHATSAPP_NUMBER não configurado"
    );
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
