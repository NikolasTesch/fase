import type { Metadata } from "next";
import { OrcamentoForm } from "@/components/forms/OrcamentoForm";

export const metadata: Metadata = {
  title: "Solicitar Orçamento",
  description:
    "Solicite um orçamento de uniformes esportivos personalizados. Futebol, vôlei, basquete e mais. Atendemos times, academias e atléticas.",
};

export default function OrcamentoPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl mb-2">Solicitar Orçamento</h1>
        <p className="text-muted-foreground mb-10">
          Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas.
        </p>
        <OrcamentoForm />
      </div>
    </main>
  );
}
