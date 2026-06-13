import type { Metadata } from "next";
import { OrcamentoForm } from "@/components/forms/OrcamentoForm";

export const metadata: Metadata = {
  title: "Solicitar Orçamento",
  description:
    "Solicite um orçamento de uniformes esportivos personalizados. Futebol, vôlei, basquete e mais. Atendemos times, academias e atléticas.",
};

const VALID_SPORTS = [
  "futebol",
  "volei",
  "basquete",
  "handebol",
  "passeio",
  "agasalho",
  "colete",
  "acessorios",
] as const;

interface OrcamentoPageProps {
  searchParams: Promise<{ sport?: string; produto?: string }>;
}

export default async function OrcamentoPage({ searchParams }: OrcamentoPageProps) {
  const { sport, produto } = await searchParams;
  const validSport =
    sport && VALID_SPORTS.includes(sport as (typeof VALID_SPORTS)[number])
      ? (sport as (typeof VALID_SPORTS)[number])
      : undefined;

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl mb-2">Solicitar Orçamento</h1>
        <p className="text-muted-foreground mb-10">
          Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas.
        </p>
        <OrcamentoForm defaultSport={validSport} defaultProductSlug={produto} />
      </div>
    </main>
  );
}
