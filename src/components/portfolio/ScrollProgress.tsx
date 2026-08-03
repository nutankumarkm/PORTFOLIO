"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[120] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 35%, var(--color-secondary) 70%, var(--color-warning) 100%)",
      }}
    />
  );
}
