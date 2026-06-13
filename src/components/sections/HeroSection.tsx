import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/site";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-brand-dark" />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-20 lg:py-28">
        <h1 className="max-w-3xl font-heading text-6xl leading-none lg:text-7xl">
          Uniformes Esportivos que Inspiram Vitórias
        </h1>
        <p className="max-w-xl text-lg text-primary-foreground/90">
          Personalização completa de uniformes para o seu time em Colatina-ES.
          Qualidade, prazo garantido e atendimento direto com a Fase Sport.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            render={
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Chamar no WhatsApp
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            render={<Link href="#categorias" />}
          >
            Ver Catálogo
          </Button>
        </div>
      </div>
    </section>
  );
}
