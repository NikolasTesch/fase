export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { TestimonialForm } from "../_components/TestimonialForm";

export const metadata: Metadata = { title: "Novo Depoimento — Admin" };

export default function NewDepoimentoPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Novo Depoimento</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adicione um depoimento de cliente.
        </p>
      </div>
      <TestimonialForm />
    </div>
  );
}
