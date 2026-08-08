"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-1 origin-left bg-gradient-to-r from-brand via-accent to-brand-light shadow-[0_0_12px_rgba(205,52,56,0.8)] pointer-events-none"
      style={{ scaleX }}
    />
  );
}
