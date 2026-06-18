"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: "div" | "button" | "a";
  href?: string;
  onClick?: () => void;
  dataCursor?: string;
  dataCursorLabel?: string;
  ariaLabel?: string;
}

export function Magnetic({
  children,
  strength = 0.4,
  className = "",
  as = "div",
  href,
  onClick,
  dataCursor,
  dataCursorLabel,
  ariaLabel,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * strength;
    const y = (e.clientY - (top + height / 2)) * strength;
    setPos({ x, y });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  const common = {
    ref: ref as never,
    onMouseMove: handleMove,
    onMouseLeave: reset,
    className,
    "data-cursor": dataCursor,
    "data-cursor-label": dataCursorLabel,
    "aria-label": ariaLabel,
  };

  const motionProps = {
    animate: { x: pos.x, y: pos.y },
    transition: { type: "spring" as const, stiffness: 200, damping: 18, mass: 0.4 },
  };

  if (as === "a" && href) {
    return (
      <motion.a href={href} {...common} {...motionProps}>
        {children}
      </motion.a>
    );
  }
  if (as === "button") {
    return (
      <motion.button onClick={onClick} {...common} {...motionProps}>
        {children}
      </motion.button>
    );
  }
  return (
    <motion.div {...common} {...motionProps}>
      {children}
    </motion.div>
  );
}
