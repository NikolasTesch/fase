"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { GlowBadge } from "@/components/ui/GlowBadge";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { trackEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

const slideUp = (delay: number) => ({
  hidden: { opacity: 0, y: 35 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay } },
});

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-brand-dark to-black text-primary-foreground">
      {/* Background image com overlay graduado */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="h-full w-full transition-transform duration-[15000ms] ease-out will-change-transform group-hover/hero:scale-105">
          <Image
            src="/images/hero-bg.jpg"
            alt="Uniformes esportivos personalizados da Fase Sport"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
        </div>
        {/* Overlay direcionado: escuro na esquerda para contraste do texto, suave na direita para destacar a foto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-brand-dark/75 to-black/35 md:from-black/85 md:via-brand-dark/60 md:to-transparent" />
      </div>

      {/* Luz ambiente e brilho em degradê */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl opacity-70 animate-pulse" />
        <div className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-primary/30 blur-3xl opacity-60" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 py-24 lg:py-36">
        {/* Badges Flutuantes de Alta Performance (Ambient Motion em Desktop) */}
        {!reduced && (
          <>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute right-8 top-28 hidden lg:flex items-center gap-2.5 rounded-2xl border border-white/15 bg-black/60 px-4 py-2.5 backdrop-blur-xl shadow-2xl"
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <Zap className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-white">Dry-Fit Tecnológico</p>
                <p className="text-[11px] text-white/70">Secagem rápida e Proteção UV</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="pointer-events-none absolute right-24 bottom-24 hidden lg:flex items-center gap-2.5 rounded-2xl border border-white/15 bg-black/60 px-4 py-2.5 backdrop-blur-xl shadow-2xl"
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-white">Sublimação HD 4K</p>
                <p className="text-[11px] text-white/70">Cores vibrantes que não desbotam</p>
              </div>
            </motion.div>
          </>
        )}

        {/* GlowBadge para anúncio */}
        <motion.div
          variants={slideUp(0)}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <GlowBadge icon={<Sparkles className="size-3.5 text-accent" />}>
            Personalização Total & Entrega Rápida
          </GlowBadge>
        </motion.div>

        <motion.h1
          className="max-w-4xl font-heading text-5xl leading-tight font-black tracking-tight drop-shadow-md sm:text-6xl md:text-7xl lg:text-8xl"
          variants={slideUp(0.1)}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          Uniformes Esportivos que <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-200 to-red-500">Inspiram Vitórias</span>
        </motion.h1>

        <motion.p
          className="max-w-2xl text-lg font-normal text-primary-foreground/85 md:text-xl leading-relaxed"
          variants={slideUp(0.2)}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          Uniformes de alta performance sob medida para o seu time com tecido Dry-Fit tecnológico, sublimação digital de alta definição e orçamento sem compromisso.
        </motion.p>

        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-center pt-2"
          variants={slideUp(0.3)}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <ShimmerButton
            size="lg"
            variant="accent"
            icon={<ArrowRight className="size-4" />}
            onClick={() => {
              trackEvent("whatsapp_click", { location: "hero" });
              window.open(buildWhatsAppUrl(), "_blank", "noopener,noreferrer");
            }}
          >
            Solicitar Orçamento Grátis
          </ShimmerButton>

          <Link href="#categorias">
            <ShimmerButton
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/40"
            >
              Ver Catálogo
            </ShimmerButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
