import { BadgeCheck, PackageCheck, Paintbrush } from "lucide-react";

const DIFERENCIAIS = [
  {
    Icon: Paintbrush,
    title: "Bordado, Silk ou Sublimação",
    description:
      "Sua logomarca aplicada com a técnica mais adequada para cada tipo de peça e material — resultado profissional garantido.",
  },
  {
    Icon: PackageCheck,
    title: "Fardamento Completo",
    description:
      "Do jaleco operacional à polo social, fornecemos todos os itens que sua equipe precisa com identidade visual unificada.",
  },
  {
    Icon: BadgeCheck,
    title: "Prazo e Qualidade Garantidos",
    description:
      "Produção própria com controle de qualidade em cada peça. Prazo de entrega acordado e cumprido — sem surpresas.",
  },
];

export function DiferenciaisEmpresariais() {
  return (
    <section className="rounded-2xl bg-muted/50 px-6 py-10 lg:px-10">
      <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-foreground lg:text-4xl">
        Por que a Fase Sport?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Atendemos empresas de todos os portes com qualidade de confecção local e suporte personalizado.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {DIFERENCIAIS.map(({ Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
