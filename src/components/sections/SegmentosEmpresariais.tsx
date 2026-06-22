"use client";

import { useRouter } from "next/navigation";
import { Briefcase, HardHat, Megaphone, Shirt } from "lucide-react";

const SEGMENTOS = [
  {
    slug: "social",
    label: "Administrativo / Social",
    description:
      "Camisas sociais e alfaiataria corporativa com bordado ou silk para equipes administrativas e staff.",
    Icon: Briefcase,
  },
  {
    slug: "polo",
    label: "Polo Profissional",
    description:
      "Polos corporativas de alta qualidade com logomarca bordada para atendimento, vendas e suporte.",
    Icon: Shirt,
  },
  {
    slug: "operacional",
    label: "Operacional / Oficinas",
    description:
      "Jalecos, brim pesado e uniformes operacionais para equipes de campo, oficinas e fábricas.",
    Icon: HardHat,
  },
  {
    slug: "promocional",
    label: "Eventos / Promocional",
    description:
      "Camisetas dry-fit e kits completos para campanhas, eventos corporativos e confraternizações.",
    Icon: Megaphone,
  },
];

interface SegmentosEmpresariaisProps {
  activeSub?: string;
}

export function SegmentosEmpresariais({ activeSub }: SegmentosEmpresariaisProps) {
  const router = useRouter();

  function select(slug: string) {
    const next = activeSub === slug ? "/empresarial" : `/empresarial?sub=${slug}`;
    router.push(next, { scroll: false });
  }

  return (
    <section>
      <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-foreground lg:text-4xl">
        Segmentos Atendidos
      </h2>
      <p className="mt-2 text-muted-foreground">
        Soluções de uniformização para cada área da sua empresa.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEGMENTOS.map(({ slug, label, description, Icon }) => {
          const isActive = activeSub === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => select(slug)}
              className={`group flex flex-col gap-3 rounded-2xl border p-6 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
