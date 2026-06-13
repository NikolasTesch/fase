import { Search, Palette, Truck } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import { StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";

const STEPS = [
  {
    icon: Search,
    title: "Escolha o modelo",
    description:
      "Navegue pelo catálogo e selecione a modalidade e o uniforme ideal para o seu time.",
  },
  {
    icon: Palette,
    title: "Personalize",
    description:
      "Defina cores, escudo, nomes e números. Enviamos a arte para sua aprovação.",
  },
  {
    icon: Truck,
    title: "Receba",
    description:
      "Produzimos com qualidade e entregamos no prazo combinado, prontos para o jogo.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Como Funciona
          </h2>
          <p className="mt-3 text-muted-foreground">
            Do modelo à entrega, em três passos simples.
          </p>
        </RevealOnScroll>
        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <StaggerItem key={step.title}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
