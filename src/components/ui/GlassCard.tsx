"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverGlow = true,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 backdrop-blur-md shadow-sm transition-all duration-300",
        hoverGlow &&
          "hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:bg-card/80",
        className
      )}
      {...props}
    >
      {/* Reflexo luminoso sutil no topo do card */}
      <div
        className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />
      {children}
    </motion.div>
  );
}
