"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Stagger vertical (padrão) ─── */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease },
  },
};

/* ─── Stagger com direção alternada ─── */

function getDirectionalVariants(dir: "left" | "right" | "up" | "down") {
  const offset = 30;
  const x = dir === "left" ? -offset : dir === "right" ? offset : 0;
  const y = dir === "up" ? offset : dir === "down" ? -offset : 0;
  return {
    hidden: { opacity: 0, x, y },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.45, ease },
    },
  };
}

function getContainerVariants(dir: "left" | "right" | "up" | "down") {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };
}

/* ─── Scale-in ─── */

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease },
  },
};

/* ─── Tipos ─── */

interface Props {
  children: React.ReactNode;
  className?: string;
}

interface DirectionalProps extends Props {
  direction?: "left" | "right" | "up" | "down";
}

/* ─── Componentes ─── */

export function StaggerContainer({ children, className }: Props) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: Props) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export function DirectionalStagger({ children, className, direction = "up" }: DirectionalProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={getContainerVariants(direction)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function DirectionalStaggerItem({ children, className, direction = "up" }: DirectionalProps) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={getDirectionalVariants(direction)}>
      {children}
    </motion.div>
  );
}

export function ScaleInWhenVisible({ children, className }: Props) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={scaleVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}
