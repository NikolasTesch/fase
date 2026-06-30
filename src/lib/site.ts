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

export interface CorporateSubNavItem {
  slug: string;
  label: string;
}

export const CORPORATE_NAV = {
  label: "Empresarial",
  slug: "empresarial",
  subcategories: [
    { slug: "social", label: "Administrativo / Social" },
    { slug: "polo", label: "Polo Profissional" },
    { slug: "operacional", label: "Operacional / Oficinas" },
    { slug: "promocional", label: "Eventos / Promocional" },
  ] as CorporateSubNavItem[],
};

export const SITE_CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  email: "contato@fasesport.com.br",
  address: "Av. Mal. Castelo Branco, 258 - Centro, Teixeira de Freitas - BA, 45985-160",
  city: "Teixeira de Freitas - BA",
} as const;

const DEFAULT_WHATSAPP_MESSAGE =
  "Olá Fase Sport! Gostaria de solicitar um orçamento.";

export function buildWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  if (!number) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[buildWhatsAppUrl] NEXT_PUBLIC_WHATSAPP_NUMBER não configurado"
      );
      return "#";
    }
    return "/orcamento";
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getSimulatorUrl(productUrl?: string | null): string | null {
  if (productUrl) return productUrl;
  const global = process.env.NEXT_PUBLIC_SIMULATOR_URL;
  return global && global.length > 0 ? global : null;
}

export function formatPhoneNumber(phone: string) {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 13 && clean.startsWith("55")) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 12 && clean.startsWith("55")) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  return phone;
}
