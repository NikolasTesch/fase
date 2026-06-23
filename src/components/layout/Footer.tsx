import Image from "next/image";
import Link from "next/link";

import { FooterWhatsAppLink } from "@/components/layout/FooterWhatsAppLink";
import { CATEGORY_NAV, SITE_CONTACT } from "@/lib/site";

const USEFUL_LINKS = [
  { href: "/como-funciona", label: "Como Funciona" },
  { href: "/orcamento", label: "Orçamento" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-primary to-brand-dark text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Image
              src="/logo-white.svg"
              alt="Fase Sport"
              width={140}
              height={72}
              className="h-10 w-auto"
            />
            <p className="max-w-xs text-sm text-primary-foreground/80">
              Uniformes esportivos personalizados em {SITE_CONTACT.city}.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-primary-foreground">
              Categorias
            </h3>
            <ul className="mt-4 space-y-2">
              {CATEGORY_NAV.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-primary-foreground">
              Links Úteis
            </h3>
            <ul className="mt-4 space-y-2">
              {USEFUL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-primary-foreground">
              Contato
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li>
                <FooterWhatsAppLink />
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  aria-label={`Enviar e-mail para ${SITE_CONTACT.email}`}
                  className="transition-colors hover:text-accent"
                >
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li className="text-primary-foreground/70">{SITE_CONTACT.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/20 pt-6 text-xs text-primary-foreground/70">
          <span>© {new Date().getFullYear()} Fase Sport. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-accent transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-accent transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
