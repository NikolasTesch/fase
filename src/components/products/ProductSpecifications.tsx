import { CheckCircle2 } from "lucide-react";

import { SizeGuideModal } from "@/components/products/SizeGuideModal";

interface PartSpec {
  partName: string;
  items: string[];
  guides: Array<{ label: string; imageKey: string }>;
}

const SPORT_SPECS_MAPPING: Record<string, PartSpec[]> = {
  futebol: [
    {
      partName: "Camisa",
      items: [
        "Tecido com Tecnologia Dry-fit de alta respirabilidade",
        "Escolha entre Escudo Sublimado, Patch Profissional ou Bordado",
        "Personalização livre de cores e designs",
        "Opções de Gola (V, careca, padre ou polo)",
        "Punhos simples ou com ribana contrastante",
        "Inclusão ilimitada de patrocinadores sem custo adicional",
        "Nome individual do atleta e numeração inclusos",
        "Selo de Produto Oficial Fase Sport na barra",
      ],
      guides: [{ label: "Guia de Medidas Camisa", imageKey: "camisa" }],
    },
    {
      partName: "Short",
      items: [
        "Tecido com Tecnologia Dry e cordão interno de ajuste",
        "Escolha entre Escudo Sublimado, Patch Profissional ou Bordado",
        "Numeração individual estampada",
        "Adicione detalhes de acabamento em viés colorido",
      ],
      guides: [
        { label: "Guia de Medidas Short Masculino", imageKey: "short-masc" },
        { label: "Guia de Medidas Short Feminino", imageKey: "short-fem" },
        { label: "Guia de Medidas Short Suplex", imageKey: "short-suplex" },
      ],
    },
    {
      partName: "Meião",
      items: [
        "Escolha entre o Meião Profissional (pé de algodão atoalhado) ou Amador",
        "Punho elástico duplo para evitar deslizamento",
      ],
      guides: [],
    },
  ],
  volei: [
    {
      partName: "Camisa",
      items: [
        "Tecido leve dry-fit com alta respirabilidade",
        "Sublimação total em alta definição",
        "Escudo e patrocinadores inclusos",
        "Numeração e nome inclusos",
      ],
      guides: [{ label: "Guia de Medidas Camisa", imageKey: "camisa" }],
    },
    {
      partName: "Short",
      items: [
        "Tecido dry com ótimo caimento",
        "Cordão interno de ajuste",
        "Numeração estampada",
      ],
      guides: [
        { label: "Guia de Medidas Short Masculino", imageKey: "short-masc" },
        { label: "Guia de Medidas Short Feminino", imageKey: "short-fem" },
      ],
    },
  ],
  handebol: [
    {
      partName: "Camisa",
      items: [
        "Tecido dry-fit respirável",
        "Sublimação total ou silk screen",
        "Escudo, numeração e nome inclusos",
      ],
      guides: [{ label: "Guia de Medidas Camisa", imageKey: "camisa" }],
    },
    {
      partName: "Short",
      items: [
        "Tecido dry-fit com ajuste lateral",
        "Numeração estampada",
      ],
      guides: [
        { label: "Guia de Medidas Short Masculino", imageKey: "short-masc" },
        { label: "Guia de Medidas Short Feminino", imageKey: "short-fem" },
      ],
    },
  ],
  basquete: [
    {
      partName: "Regata",
      items: [
        "Modelagem americana ampla com cavas confortáveis",
        "Tecido Dry-fit de alta gramatura e secagem rápida",
        "Cavas e gola com acabamento em debrum contrastante",
        "Nomes, patrocínios e números sublimados",
      ],
      guides: [{ label: "Guia de Medidas Regata", imageKey: "regata" }],
    },
    {
      partName: "Bermuda",
      items: [
        "Corte longo estilo basquete de rua",
        "Cós elástico largo de 50mm e cordão de ajuste interno",
        "Bolsos laterais opcionais para uso no dia a dia",
      ],
      guides: [{ label: "Guia de Medidas Bermuda", imageKey: "bermuda" }],
    },
  ],
};

const GENERIC_SPEC = (fabric?: string | null, minQty?: number | null): PartSpec[] => [
  {
    partName: "Especificações Gerais",
    items: [
      ...(fabric ? [`Tecido: ${fabric}`] : []),
      ...(minQty ? [`Quantidade mínima: ${minQty} peças`] : []),
      "Sublimação total em alta definição",
      "Personalização completa de cores e detalhes",
      "Numeração e nome inclusos sem custo adicional",
    ],
    guides: [{ label: "Guia de Medidas Geral", imageKey: "camisa" }],
  },
];

interface ProductSpecificationsProps {
  categorySlug: string;
  fabric?: string | null;
  minQty?: number | null;
  chartByType?: Map<string, { columns: string[]; rows: { label: string; values: string[] }[] }>;
}

export function ProductSpecifications({
  categorySlug,
  fabric,
  minQty,
  chartByType,
}: ProductSpecificationsProps) {
  const parts =
    SPORT_SPECS_MAPPING[categorySlug] ?? GENERIC_SPEC(fabric, minQty);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-2xl text-foreground">Ficha Técnica</h2>
      {parts.map((part) => (
        <div key={part.partName} className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-heading text-lg text-foreground">
            {part.partName}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {part.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          {part.guides.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
              {part.guides.map((guide) => (
                <SizeGuideModal
                  key={guide.imageKey}
                  label={guide.label}
                  imageKey={guide.imageKey}
                  chartData={chartByType?.get(guide.imageKey) ?? null}
                />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
