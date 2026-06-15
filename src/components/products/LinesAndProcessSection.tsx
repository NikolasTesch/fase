import { Check, Minus } from "lucide-react";

import {
  PhoneChatIcon,
  JerseyIcon,
  PaymentIcon,
  SewingMachineIcon,
  CalendarCheckIcon,
  DeliveryTruckIcon,
} from "@/components/ui/icons";

const LINES = [
  {
    name: "Linha Prata",
    tagline: "Conforto e economia",
    color: "text-zinc-400",
    features: {
      sublimacao: true,
      escudo: "Sublimado",
      patrocinadores: true,
      dryFit: "Básico",
      garantia: "6 meses",
    },
  },
  {
    name: "Linha Ouro",
    tagline: "Alta definição e durabilidade",
    color: "text-yellow-500",
    highlight: true,
    features: {
      sublimacao: true,
      escudo: "Patch profissional",
      patrocinadores: true,
      dryFit: "Premium",
      garantia: "12 meses",
    },
  },
  {
    name: "Profissional",
    tagline: "Materiais combinados",
    color: "text-primary",
    features: {
      sublimacao: true,
      escudo: "Bordado + Patch",
      patrocinadores: true,
      dryFit: "Tecnológico",
      garantia: "18 meses",
    },
  },
];

const PROCESS_QUICK = [
  { icon: PhoneChatIcon, label: "Solicitar" },
  { icon: JerseyIcon, label: "Personalizar" },
  { icon: PaymentIcon, label: "Pagar" },
  { icon: SewingMachineIcon, label: "Produzir" },
  { icon: CalendarCheckIcon, label: "Aguardar" },
  { icon: DeliveryTruckIcon, label: "Receber" },
];

export function LinesAndProcessSection() {
  return (
    <section className="mt-12 flex flex-col gap-12">
      {/* Lines comparison */}
      <div>
        <h2 className="mb-6 font-heading text-3xl text-foreground">
          Nossas Linhas de Produção
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-muted-foreground font-medium">
                  Recurso
                </th>
                {LINES.map((line) => (
                  <th
                    key={line.name}
                    className={`pb-3 text-center font-heading text-base ${line.highlight ? "text-primary" : "text-foreground"}`}
                  >
                    <div className={line.color}>{line.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {line.tagline}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { label: "Sublimação total", key: "sublimacao" as const },
                { label: "Escudo", key: "escudo" as const },
                { label: "Patrocinadores", key: "patrocinadores" as const },
                { label: "Tecido Dry-fit", key: "dryFit" as const },
                { label: "Garantia", key: "garantia" as const },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="py-3 text-muted-foreground">{row.label}</td>
                  {LINES.map((line) => {
                    const val = line.features[row.key];
                    return (
                      <td key={line.name} className="py-3 text-center">
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check className="mx-auto size-4 text-primary" />
                          ) : (
                            <Minus className="mx-auto size-4 text-muted-foreground/40" />
                          )
                        ) : (
                          <span className="text-foreground">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick process summary */}
      <div>
        <h2 className="mb-6 font-heading text-3xl text-foreground">
          Como Funciona o Pedido
        </h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {PROCESS_QUICK.map((step, i) => (
            <div
              key={step.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="size-6" />
              </span>
              <span className="text-xs font-medium text-foreground">
                {String(i + 1).padStart(2, "0")}. {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
