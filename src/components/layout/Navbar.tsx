"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown, Moon, Sun, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORY_NAV } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { SearchForm } from "./SearchForm";

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const shouldReduce = useReducedMotion();

  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => false
  );

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={shouldReduce ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow duration-300 ${scrolled ? "shadow-md border-b border-border" : "border-b border-transparent"}`}
    >
      <div
        className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}
      >
        <Link href="/" aria-label="Fase Sport — início" className="shrink-0">
          <Image
            src={isDark ? "/logo-white.svg" : "/logo.svg"}
            alt="Fase Sport"
            width={116}
            height={60}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {/* Menu Dropdown: Categorias Esportivas */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={categoriesOpen}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Categorias Esportivas
              <ChevronDown
                className={`size-3.5 text-muted-foreground transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {categoriesOpen ? (
                <motion.div
                  initial={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-border bg-background/95 backdrop-blur-md p-3 shadow-xl"
                >
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Linha de Esportes
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {CATEGORY_NAV.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/${cat.slug}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>

                  <div className="my-2 border-t border-border/60" />

                  <Link
                    href="/empresarial"
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Uniformes Empresariais
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      Corporativo
                    </span>
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Destaques */}
          <Link
            href="/#destaques"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Destaques
          </Link>

          {/* Avaliações */}
          <Link
            href="/#depoimentos"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Avaliações
          </Link>

          {/* Onde Estamos */}
          <Link
            href="/#contato"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Onde Estamos
          </Link>

          {/* Botão Fabi (Abre o chat modal) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-fabi-chat"))}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-muted"
          >
            Fabi
          </button>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => {
              const html = document.documentElement;
              const next = !html.classList.contains("dark");
              html.classList.toggle("dark", next);
              localStorage.setItem("fase_theme", next ? "dark" : "light");
            }}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>

          <SearchForm />
          <Button
            size="lg"
            variant="accent"
            className="hidden md:inline-flex"
            render={<Link href="/orcamento" />}
          >
            Orçamento
          </Button>
          <MobileMenu />
        </div>
      </div>
    </motion.header>
  );
}
