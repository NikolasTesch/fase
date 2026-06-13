import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SITE_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Uso — Fase Sport",
  robots: { index: false },
};

export default function TermosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 lg:py-16">
      <Breadcrumb
        items={[{ label: "Início", href: "/" }, { label: "Termos de Uso" }]}
      />

      <header className="mt-6 mb-10">
        <h1 className="font-heading text-3xl text-foreground lg:text-4xl">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualizado em junho de 2026
        </p>
      </header>

      <div className="space-y-10 text-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold">1. Aceitação</h2>
          <p className="text-muted-foreground">
            Ao navegar neste site ou enviar uma solicitação de orçamento, você
            concorda com os presentes Termos de Uso. Caso não concorde, pedimos
            que não utilize nossos serviços digitais.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">2. Uso do site</h2>
          <p className="text-muted-foreground">
            Este site destina-se exclusivamente à apresentação do catálogo de
            uniformes esportivos da Fase Sport e ao envio de solicitações de
            orçamento. Não realizamos vendas diretamente pelo site (sem
            e-commerce). Os preços são acordados individualmente após contato
            comercial.
          </p>
          <p className="mt-3 text-muted-foreground">
            É proibido utilizar este site para fins ilícitos, enviar conteúdo
            falso ou abusivo através dos formulários, ou tentar comprometer a
            segurança ou disponibilidade da plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">3. Propriedade intelectual</h2>
          <p className="text-muted-foreground">
            Todo o conteúdo deste site — incluindo textos, logotipos, fotografias
            de produtos, modelos de uniformes e layout visual — é de propriedade
            da Fase Sport ou licenciado para uso pela empresa. É vedada a
            reprodução, distribuição ou uso comercial sem autorização prévia por
            escrito.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">4. Limitação de responsabilidade</h2>
          <p className="text-muted-foreground">
            As imagens e informações do catálogo são meramente ilustrativas. Cores,
            acabamentos e detalhes podem variar conforme a personalização acordada
            com o cliente. Preços e prazos de entrega são definidos individualmente
            e estão sujeitos a alteração.
          </p>
          <p className="mt-3 text-muted-foreground">
            A Fase Sport não se responsabiliza por interrupções temporárias do
            site, imprecisões técnicas ou conteúdo de sites de terceiros
            referenciados.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">5. Lei aplicável</h2>
          <p className="text-muted-foreground">
            Estes Termos de Uso são regidos pelas leis da República Federativa do
            Brasil. Para a resolução de conflitos, fica eleito o foro da comarca
            de Teixeira de Freitas, Estado da Bahia, com exclusão de qualquer outro,
            por mais privilegiado que seja.
          </p>
          <p className="mt-3 text-muted-foreground">
            Em caso de dúvidas, entre em contato:{" "}
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="text-primary underline underline-offset-4"
            >
              {SITE_CONTACT.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
