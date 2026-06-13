import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <p className="font-heading text-7xl text-primary">404</p>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl text-foreground lg:text-4xl">
          Página não encontrada
        </h1>
        <p className="max-w-md text-muted-foreground">
          O conteúdo que você procura não existe ou foi movido. Volte para o
          início e explore os uniformes da Fase Sport.
        </p>
      </div>
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        Voltar para o início
      </Link>
    </section>
  );
}
