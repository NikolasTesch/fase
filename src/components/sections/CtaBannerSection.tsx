import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/site";

export function CtaBannerSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary to-brand-dark text-primary-foreground">
      {/* Padrão diagonal esportivo */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
        }}
        aria-hidden="true"
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-heading text-4xl lg:text-5xl">
            Pronto para vestir o seu time?
          </h2>
          <p className="text-primary-foreground/90">
            Solicite um orçamento sem compromisso ou fale agora com a nossa
            equipe pelo WhatsApp.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="accent"
            render={<Link href="/orcamento" />}
          >
            Solicitar Orçamento
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
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
        </div>
      </div>
    </section>
  );
}
