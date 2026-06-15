"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORY_NAV, CORPORATE_NAV } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { SearchForm } from "./SearchForm";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [corporateOpen, setCorporateOpen] = useState(false);
  const shouldReduce = useReducedMotion();

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
      className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}
    >
      <div
        className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}
      >
        <Link href="/" aria-label="Fase Sport — início" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="Fase Sport"
            width={116}
            height={60}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {CATEGORY_NAV.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              onMouseEnter={() => setHoveredSlug(item.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-foreground"
            >
              <span className="relative z-10">{item.label}</span>
              {hoveredSlug === item.slug && !shouldReduce ? (
                <motion.span
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 -z-10 rounded-lg bg-muted"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              ) : null}
            </Link>
          ))}

          {/* Empresarial dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCorporateOpen(true)}
            onMouseLeave={() => setCorporateOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={corporateOpen}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {CORPORATE_NAV.label}
              <ChevronDown
                className={`size-3.5 text-muted-foreground transition-transform duration-200 ${corporateOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {corporateOpen ? (
                <motion.div
                  initial={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-background p-2 shadow-lg"
                >
                  {CORPORATE_NAV.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/${CORPORATE_NAV.slug}?sub=${sub.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <SearchForm />
          <Button
            size="lg"
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
