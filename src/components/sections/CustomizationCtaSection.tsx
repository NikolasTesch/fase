import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/site";

export function CustomizationCtaSection() {
  const whatsappUrl = buildWhatsAppUrl(
    "Olá Fase Sport! Quero personalizar um uniforme para o meu time."
  );

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Placeholder visual até imagem real ser adicionada ao R2 */}
          <RevealOnScroll className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-primary/5 shadow-lg flex items-center justify-center">
            <span className="font-heading text-8xl font-bold text-primary/20 select-none">FASE</span>
          </RevealOnScroll>

          {/* Text */}
          <RevealOnScroll className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Personalização total
            </p>
            <h2 className="font-heading text-5xl text-foreground lg:text-6xl">
              No seu estilo, do jeito que você quer
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Cores, escudo, patrocinadores, nomes e números — tudo 100%
              personalizado sem custo adicional. Nossa equipe cria a arte e
              você aprova antes da produção começar.
            </p>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              {[
                "Sublimação total em alta definição",
                "Escudo bordado, sublimado ou patch profissional",
                "Inclusão ilimitada de patrocinadores",
                "Nomes e numeração individuais inclusos",
                "Arte enviada para aprovação antes da produção",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/orcamento" />}>
                Solicitar Orçamento
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
              >
                Chamar no WhatsApp
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
