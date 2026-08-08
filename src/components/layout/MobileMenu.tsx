"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ChevronRight, Sun, Moon, Sparkles } from "lucide-react";

import { CATEGORY_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  const panelMotion = reducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.18, ease: "easeOut" as const },
      };

  return (
    <div className="md:hidden">
      <button
        type="button"
        data-testid="mobile-menu-button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-lg text-foreground",
          "transition-colors hover:bg-muted focus-visible:outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50"
        )}
      >
        {open ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <Menu className="size-6" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg max-h-[85vh] overflow-y-auto"
          >
            <nav data-testid="mobile-menu-nav" className="flex flex-col p-2">
              {/* Categorias Esportivas Accordion */}
              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                className="flex items-center justify-between rounded-lg px-4 py-3 text-base font-bold text-foreground transition-colors hover:bg-muted"
              >
                Categorias Esportivas
                <ChevronRight
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    categoriesOpen && "rotate-90"
                  )}
                />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={reducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden bg-muted/30 rounded-xl my-1 p-2"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {CATEGORY_NAV.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="my-2 border-t border-border/60" />
                    <Link
                      href="/empresarial"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Uniformes Empresariais
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Corporativo
                      </span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Destaques */}
              <Link
                href="/#destaques"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                Destaques
              </Link>

              {/* Avaliações */}
              <Link
                href="/#depoimentos"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                Avaliações
              </Link>

              {/* Onde Estamos */}
              <Link
                href="/#contato"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                Onde Estamos
              </Link>

              {/* Botão Fabi (Abre o chat modal) */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("open-fabi-chat"));
                }}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 py-3 text-base font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Sparkles className="size-4 animate-pulse" />
                Fabi (Assistente IA)
              </button>

              <div className="my-2 border-t border-border" />

              {/* Theme toggle */}
              <button
                type="button"
                onClick={() => {
                  const html = document.documentElement;
                  const next = !html.classList.contains("dark");
                  html.classList.toggle("dark", next);
                  localStorage.setItem("fase_theme", next ? "dark" : "light");
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Sun className="size-5 hidden dark:block" />
                <Moon className="size-5 block dark:hidden" />
                <span className="dark:hidden">Modo escuro</span>
                <span className="hidden dark:inline">Modo claro</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
