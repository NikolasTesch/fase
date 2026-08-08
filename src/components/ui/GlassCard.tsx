"use client";

import React, { useRef } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group/card relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 backdrop-blur-md shadow-sm transition-all duration-300",
        hoverGlow &&
          "hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:bg-card/80",
        className
      )}
      {...props}
    >
      {/* Dynamic mouse spotlight gradient overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(229, 46, 53, 0.15), transparent 80%)`,
        }}
        aria-hidden="true"
      />
      {/* Reflexo luminoso sutil no topo do card */}
      <div
        className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        aria-hidden="true"
      />
      {children}
    </motion.div>
  );
}
