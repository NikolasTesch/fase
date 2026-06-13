"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { CATEGORY_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) {
      setOpen(false);
    }
  }

  const panelMotion = reducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
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
        onClick={() => setOpen((value) => !value)}
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
            className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg"
          >
            <nav className="flex flex-col p-2">
              {CATEGORY_NAV.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className={cn(
                    "rounded-lg px-4 py-3 text-base font-medium text-foreground",
                    "transition-colors hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
