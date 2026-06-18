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
          "linear-gradient(90deg, var(--lime) 0%, var(--cyan) 35%, var(--magenta) 70%, var(--amber) 100%)",
      }}
    />
  );
}
