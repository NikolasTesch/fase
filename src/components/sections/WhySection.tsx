import { Shield, Clock, Users, MapPin } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

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
    title: "Feito em Colatina-ES",
    description:
      "Produção local com a confiança de quem conhece o esporte da região.",
  },
];

export function WhySection() {
  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Por que a Fase?
          </h2>
          <p className="mt-3 text-muted-foreground">
            O que faz do seu uniforme um diferencial dentro e fora de campo.
          </p>
        </RevealOnScroll>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIALS.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 0.05}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-2xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
