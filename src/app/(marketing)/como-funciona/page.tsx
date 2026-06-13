import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FaqAccordion } from "@/components/sections/FaqAccordion";

export const metadata: Metadata = {
  title: "Como Funciona | Fase Sport",
  description:
    "Entenda como funciona o processo de pedido de uniformes esportivos personalizados na Fase Sport de Colatina-ES.",
};

export default async function ComoFuncionaPage() {
  const faqs = await prisma.faq.findMany({
    where: { categoryId: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, question: true, answer: true },
  });

  return (
    <div>
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4">
          <h1 className="max-w-3xl font-heading text-5xl text-foreground lg:text-6xl">
            Como funciona
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Do primeiro contato à entrega, a gente cuida de cada etapa para o
            seu time receber um uniforme com a cara da Fase. Veja como é
            simples.
          </p>
        </div>
      </section>

      <ProcessSteps />

      {faqs.length > 0 && (
        <FaqAccordion
          faqs={faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          }))}
        />
      )}

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto w-full max-w-3xl px-4 text-center">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Pronto para vestir o seu time?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Solicite um orçamento sem compromisso e receba uma proposta
            personalizada.
          </p>
          <Button
            size="lg"
            className="mt-8"
            render={<Link href="/orcamento" />}
          >
            Solicitar Orçamento
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </div>
  );
}
