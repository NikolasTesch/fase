import { Shield, Clock, Users, MapPin } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import { StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";

const DIFFERENTIALS = [
  {
    icon: Shield,
    title: "Qualidade Comprovada",
    description:
      "Tecidos de alta performance e acabamento que aguentam o ritmo do esporte.",
  },
  {
    icon: Clock,
    title: "Prazo Garantido",
    description:
      "Produção planejada para entregar dentro do prazo combinado, sem surpresas.",
  },
  {
    icon: Users,
    title: "Atendimento Personalizado",
    description:
      "Acompanhamento direto do pedido à entrega, com você em cada etapa.",
  },
  {
    icon: MapPin,
    title: "Feito em Teixeira de Freitas-BA",
    description:
      "Produção local com a confiança de quem conhece o esporte da região.",
  },
];

export function WhySection() {
  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Por que escolher a Fase?
          </p>
          <h2 className="mt-2 font-heading text-5xl text-foreground lg:text-6xl">
            O que faz a diferença
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Do tecido ao acabamento, cada detalhe é pensado para o seu time
            entrar em campo com confiança e estilo.
          </p>
        </RevealOnScroll>
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIALS.map((item) => (
            <StaggerItem key={item.title}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border/60 bg-card p-8 text-card-foreground shadow-sm ring-1 ring-black/[0.02] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-accent/20">
                <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-accent/10 to-accent/5 text-accent ring-1 ring-accent/20">
                  <item.icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
