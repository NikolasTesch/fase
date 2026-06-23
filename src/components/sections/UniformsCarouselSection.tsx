import Image from "next/image";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

interface UniformItem {
  imageUrl: string | null;
  imageAlt: string | null;
  name: string;
}

interface UniformsCarouselSectionProps {
  uniforms?: UniformItem[];
}

const PLACEHOLDER_COUNT = 8;

export function UniformsCarouselSection({ uniforms = [] }: UniformsCarouselSectionProps) {
  const items = uniforms.length > 0 ? [...uniforms, ...uniforms] : [];

  return (
    <section className="bg-muted py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Nossos trabalhos
          </p>
          <h2 className="mt-2 font-heading text-4xl text-foreground lg:text-5xl">
            Uniformes que já vestiram campeões
          </h2>
          <p className="mt-3 text-muted-foreground">
            Uma amostra dos mantos confeccionados pela Fase Sport.
          </p>
        </RevealOnScroll>
      </div>

      <div className="relative overflow-hidden">
        {items.length > 0 ? (
          <div
            className="animate-marquee flex gap-4"
            style={{ width: "max-content" }}
          >
            {items.map((uniform, i) => (
              <div
                key={i}
                className="relative h-64 w-64 shrink-0 overflow-hidden rounded-xl bg-muted transition-transform duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-brand-dark/15">
                  <span className="font-heading text-3xl font-bold text-primary/30">FASE</span>
                </div>
                {uniform.imageUrl ? (
                  <Image
                    src={uniform.imageUrl}
                    alt={uniform.imageAlt ?? uniform.name}
                    fill
                    sizes="256px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 px-4" style={{ width: "max-content" }}>
            {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
              <div
                key={i}
                className="relative h-64 w-64 shrink-0 overflow-hidden rounded-xl bg-primary/5 flex items-center justify-center"
              >
                <span className="font-heading text-3xl font-bold text-primary/20">FASE</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
