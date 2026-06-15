import Image from "next/image";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

const UNIFORMS = [
  { src: "/images/uniform-1.jpg", alt: "Uniforme de futebol Fase Sport" },
  { src: "/images/uniform-2.jpg", alt: "Uniforme de vôlei Fase Sport" },
  { src: "/images/uniform-3.jpg", alt: "Uniforme de basquete Fase Sport" },
  { src: "/images/uniform-4.jpg", alt: "Kit esportivo Fase Sport" },
  { src: "/images/uniform-5.jpg", alt: "Uniforme personalizado Fase Sport" },
  { src: "/images/uniform-6.jpg", alt: "Uniforme de handebol Fase Sport" },
];

const ITEMS = [...UNIFORMS, ...UNIFORMS];

export function UniformsCarouselSection() {
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
        <div
          className="animate-marquee flex gap-4"
          style={{ width: "max-content" }}
        >
          {ITEMS.map((uniform, i) => (
            <div
              key={i}
              className="relative h-64 w-64 shrink-0 overflow-hidden rounded-xl bg-muted transition-transform duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <span className="font-heading text-3xl font-bold text-primary/30">FASE</span>
              </div>
              <Image
                src={uniform.src}
                alt={uniform.alt}
                fill
                sizes="256px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
