"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "accent" | "primary" | "outline";
  className?: string;
}

export function GlowBadge({
  children,
  icon,
  variant = "accent",
  className,
}: GlowBadgeProps) {
  const isAccent = variant === "accent";
  const isPrimary = variant === "primary";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide backdrop-blur-md transition-all duration-300 shadow-sm",
        isAccent &&
          "border border-accent/30 bg-accent/10 text-accent shadow-accent/10 hover:border-accent/60 hover:bg-accent/15",
        isPrimary &&
          "border border-primary/30 bg-primary/10 text-primary shadow-primary/10 hover:border-primary/60 hover:bg-primary/15",
        variant === "outline" &&
          "border border-border bg-background/60 text-foreground hover:bg-muted/50",
        className
      )}
    >
      {/* Ponto reluzente com pulso animado */}
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            isAccent ? "bg-accent" : isPrimary ? "bg-primary" : "bg-muted-foreground"
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            isAccent ? "bg-accent" : isPrimary ? "bg-primary" : "bg-muted-foreground"
          )}
        />
      </span>

      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.div>
  );
}
