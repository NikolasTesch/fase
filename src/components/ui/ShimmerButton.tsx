"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "accent" | "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

export function ShimmerButton({
  children,
  variant = "accent",
  size = "md",
  className,
  icon,
  ...props
}: ShimmerButtonProps) {
  const isAccent = variant === "accent";
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold tracking-wide shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "sm" && "px-4 py-2 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        isAccent &&
          "bg-accent text-accent-foreground shadow-accent/25 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30",
        isPrimary &&
          "bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30",
        isSecondary &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" &&
          "border border-border bg-background/80 text-foreground hover:bg-accent/10 hover:border-accent/40 hover:text-accent",
        className
      )}
      {...props}
    >
      {/* Feixe de luz brilhante passando pelo botão */}
      <span
        className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
        aria-hidden="true"
      />
      {children}
      {icon && <span className="transition-transform duration-200 group-hover:translate-x-1">{icon}</span>}
    </motion.button>
  );
}
