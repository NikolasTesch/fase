"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const slideUp = (delay: number) => ({
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay } },
});

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary to-brand-dark text-primary-foreground">
      {/* Background image com parallax sutil */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="h-full w-full transition-transform duration-[15000ms] ease-out will-change-transform group-hover/hero:scale-105">
          <Image
            src="/images/hero-bg.jpg"
            alt="Uniformes esportivos personalizados da Fase Sport"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-brand-dark/95" />
      </div>

      {/* Elementos decorativos esportivos */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Padrão diagonal */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
          }}
        />
        {/* Círculo decorativo grande */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-accent/10 opacity-50" />
        <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full border border-accent/15 opacity-30" />
        {/* Círculo decorativo médio */}
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-20 lg:py-32">
        {/* Badge decorativo */}
        {!reduced ? (
          <motion.span
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur-sm"
            variants={slideUp(0)}
            initial="hidden"
            animate="show"
          >
            Personalização Total
          </motion.span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur-sm">
            Personalização Total
          </span>
        )}

        <motion.h1
          className="max-w-4xl font-heading text-6xl leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] lg:text-8xl"
          variants={slideUp(0.1)}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          Uniformes Esportivos que Inspiram Vitórias
        </motion.h1>

        <motion.p
          className="max-w-xl text-lg text-primary-foreground/85 lg:text-xl"
          variants={slideUp(0.2)}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          Personalização completa de uniformes para o seu time em Teixeira de Freitas-BA.
          Qualidade, prazo garantido e atendimento direto com a Fase Sport.
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          variants={slideUp(0.3)}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <Button
            size="lg"
            variant="accent"
            className="group"
            render={
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("whatsapp_click", { location: "hero" })
                }
              />
            }
          >
            Chamar no WhatsApp
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            render={<Link href="#categorias" />}
          >
            Ver Catálogo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
