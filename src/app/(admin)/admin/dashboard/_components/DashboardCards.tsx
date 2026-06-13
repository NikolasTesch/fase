"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CardColor = "blue" | "amber" | "green" | "purple" | "brand";

type Card = {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  color: CardColor;
  description: string;
};

const colorMap: Record<
  CardColor,
  { bg: string; icon: string; ring: string; text: string }
> = {
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    icon: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    icon: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  green: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    icon: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    icon: "text-purple-600 dark:text-purple-400",
    ring: "ring-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  brand: {
    bg: "bg-primary/10",
    icon: "text-primary",
    ring: "ring-primary/20",
    text: "text-primary",
  },
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function DashboardCards({ cards }: { cards: Card[] }) {
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
              className="group block rounded-2xl border border-border bg-card p-5 hover:border-border/80 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Icon badge */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center ring-1 mb-4",
                  c.bg,
                  c.ring,
                )}
              >
                <Icon size={18} className={c.icon} />
              </div>

              {/* Value */}
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {value}
              </p>

              {/* Label */}
              <p className="text-sm font-medium mt-0.5">{label}</p>

              {/* Description */}
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
