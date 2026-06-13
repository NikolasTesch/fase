import { Search, Palette, ClipboardCheck, Truck } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

const STEPS = [
  {
    icon: Search,
    title: "Escolha o Modelo",
    description:
      "Navegue pelo catálogo e encontre o uniforme ideal para a sua modalidade.",
  },
  {
    icon: Palette,
    title: "Personalize",
    description:
      "Defina cores, escudo, nomes e numeração do jeito que o seu time precisa.",
  },
  {
    icon: ClipboardCheck,
    title: "Confirme o Pedido",
    description:
      "Aprovamos juntos o layout, a quantidade e o prazo antes de iniciar a produção.",
  },
  {
    icon: Truck,
    title: "Receba",
    description:
      "Produzimos com qualidade e entregamos o seu uniforme dentro do prazo combinado.",
  },
];

export function ProcessSteps() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Como funciona o pedido
          </h2>
          <p className="mt-3 text-muted-foreground">
            Do modelo à entrega, são quatro etapas simples para o seu time
            vestir a camisa.
          </p>
        </RevealOnScroll>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <RevealOnScroll key={step.title} delay={index * 0.05}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span
                    className="font-heading text-4xl text-muted-foreground/40"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-heading text-2xl">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
