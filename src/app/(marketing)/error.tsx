"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[marketing/error]", error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl text-foreground lg:text-4xl">
          Algo deu errado
        </h1>
        <p className="max-w-md text-muted-foreground">
          Não foi possível carregar esta página. Tente novamente em alguns
          instantes.
        </p>
      </div>
      <Button size="lg" onClick={() => reset()}>
        Tentar novamente
      </Button>
    </section>
  );
}
