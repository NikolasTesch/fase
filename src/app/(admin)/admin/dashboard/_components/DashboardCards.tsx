"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Users, MessageSquare, HelpCircle, Tag, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CardColor = "blue" | "amber" | "green" | "purple" | "brand";

type CardValues = {
  products: number;
  leads: number;
  testimonials: number;
  faqs: number;
  categories: number;
};

const colorMap: Record<
  CardColor,
  { bg: string; icon: string; ring: string; badge: string }
> = {
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15 group-hover:bg-blue-500/20",
    icon: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/20 border-blue-500/20",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15 group-hover:bg-amber-500/20",
    icon: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20 border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  green: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15 group-hover:bg-emerald-500/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20 border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/15 group-hover:bg-purple-500/20",
    icon: "text-purple-600 dark:text-purple-400",
    ring: "ring-purple-500/20 border-purple-500/20",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  brand: {
    bg: "bg-primary/10 group-hover:bg-primary/20",
    icon: "text-primary",
    ring: "ring-primary/20 border-primary/20",
    badge: "bg-primary/10 text-primary",
  },
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function DashboardCards({ counts }: { counts: CardValues }) {
  const cards = [
    {
      label: "Produtos ativos",
      value: counts.products,
      href: "/admin/produtos",
      icon: Package,
      color: "blue" as CardColor,
      description: "catalogo oficial",
    },
    {
      label: "Leads novos",
      value: counts.leads,
      href: "/admin/leads",
      icon: Users,
      color: "amber" as CardColor,
      description: "aguardando resposta",
    },
    {
      label: "Depoimentos",
      value: counts.testimonials,
      href: "/admin/depoimentos",
      icon: MessageSquare,
      color: "green" as CardColor,
      description: "publicados no site",
    },
    {
      label: "FAQs ativas",
      value: counts.faqs,
      href: "/admin/faqs",
      icon: HelpCircle,
      color: "purple" as CardColor,
      description: "perguntas frequentes",
    },
    {
      label: "Categorias",
      value: counts.categories,
      href: "/admin/categorias",
      icon: Tag,
      color: "brand" as CardColor,
      description: "modalidades esportivas",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {cards.map(({ label, value, href, icon: Icon, color, description }) => {
        const c = colorMap[color];

        return (
          <motion.div key={href} variants={item}>
            <Link
              href={href}
              className="group relative block rounded-2xl border border-border/80 bg-card/80 p-5 hover:border-border hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                {/* Icon badge */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-colors duration-200",
                    c.bg,
                    c.ring,
                  )}
                >
                  <Icon size={19} className={c.icon} />
                </div>

                <div className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Value */}
              <p className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
                {value}
              </p>

              {/* Label */}
              <p className="text-sm font-bold text-foreground/90 mt-1">{label}</p>

              {/* Description */}
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
