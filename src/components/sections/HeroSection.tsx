"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const base = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-brand-dark" />
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-20 lg:py-28">
        <motion.h1
          className="max-w-3xl font-heading text-6xl leading-none lg:text-7xl"
          variants={base}
          initial={reduced ? false : "hidden"}
          animate="show"
          transition={{ duration: 0.55, ease, delay: 0 }}
        >
          Uniformes Esportivos que Inspiram Vitórias
        </motion.h1>

        <motion.p
          className="max-w-xl text-lg text-primary-foreground/90"
          variants={base}
          initial={reduced ? false : "hidden"}
          animate="show"
          transition={{ duration: 0.55, ease, delay: 0.12 }}
        >
          Personalização completa de uniformes para o seu time em Colatina-ES.
          Qualidade, prazo garantido e atendimento direto com a Fase Sport.
        </motion.p>

        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          variants={base}
          initial={reduced ? false : "hidden"}
          animate="show"
          transition={{ duration: 0.55, ease, delay: 0.22 }}
        >
          <Button
            size="lg"
            variant="secondary"
            render={
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Chamar no WhatsApp
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            render={<Link href="#categorias" />}
          >
            Ver Catálogo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
