import { ProcessSteps } from "@/components/sections/ProcessSteps";

export function HowItWorksSection() {
  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 lg:pt-24">
        <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
          Como Funciona
        </h2>
        <p className="mt-3 text-muted-foreground">
          Do primeiro contato ao uniforme em mãos, em seis etapas simples.
        </p>
      </div>
      <ProcessSteps />
    </div>
  );
}
