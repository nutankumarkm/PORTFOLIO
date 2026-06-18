"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

type CursorVariant = "default" | "hover" | "view" | "drag" | "text";

const subscribeTouch = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const getTouchSnapshot = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window || window.matchMedia("(pointer: coarse)").matches
  );
};

const getServerTouchSnapshot = () => false;

export function Cursor() {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [label, setLabel] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  const isTouch = useSyncExternalStore(
    subscribeTouch,
    getTouchSnapshot,
    getServerTouchSnapshot
  );

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const ringX = useSpring(cursorX, { damping: 25, stiffness: 350, mass: 0.6 });
  const ringY = useSpring(cursorY, { damping: 25, stiffness: 350, mass: 0.6 });

  useEffect(() => {
    if (isTouch) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, [data-cursor], [role='button'], input, textarea, select, [data-cursor-label]"
      ) as HTMLElement | null;

      if (interactive) {
        const customVariant = interactive.dataset.cursor as
          | CursorVariant
          | undefined;
        const customLabel = interactive.dataset.cursorLabel || "";
        setVariant(customVariant || "hover");
        setLabel(customLabel);
      } else {
        setVariant("default");
        setLabel("");
      }
    };

    const leave = () => setIsVisible(false);
    const enter = () => setIsVisible(true);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, [cursorX, cursorY, isVisible, isTouch]);

  if (isTouch) return null;

  const sizes: Record<CursorVariant, number> = {
    default: 10,
    hover: 56,
    view: 88,
    drag: 72,
    text: 4,
  };

  const ringSize = sizes[variant];

  return (
    <>
      {/* Dot — instant follow */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block"
        style={{ x: cursorX, y: cursorY }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{
            width: variant === "text" ? 2 : 6,
            height: variant === "text" ? 24 : 6,
            backgroundColor:
              variant === "default" ? "#d4ff3a" : "rgba(212,255,58,0)",
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>

      {/* Ring — spring follow with morphing size + label */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:flex items-center justify-center"
        style={{ x: ringX, y: ringY }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center font-mono-display uppercase tracking-widest"
          animate={{
            width: ringSize,
            height: ringSize,
            borderColor:
              variant === "default"
                ? "rgba(212,255,58,0.4)"
                : "rgba(212,255,58,0.9)",
            backgroundColor:
              variant === "default"
                ? "rgba(212,255,58,0)"
                : variant === "view"
                ? "rgba(212,255,58,0.12)"
                : "rgba(212,255,58,0.06)",
            fontSize: 9,
            color: "#d4ff3a",
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 28,
            mass: 0.5,
          }}
        >
          <AnimatePresence mode="wait">
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="px-1 text-center leading-none"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
