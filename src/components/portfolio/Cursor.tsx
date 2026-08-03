"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

type CursorVariant = "default" | "hover" | "view" | "drag" | "text";

const subscribeTouch = (cb: () => void) => {
  if (typeof window === "undefined") return () => { };
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

    let rafId = 0;
    let pendingTarget: HTMLElement | null = null;
    // Remember the last resolved hit so identical frames skip the setState pair
    // entirely rather than relying on React's bail-out.
    let lastTarget: HTMLElement | null = null;

    // Selector matching is a DOM walk up the tree; run it at most once a frame.
    const resolveTarget = () => {
      rafId = 0;
      const target = pendingTarget;
      if (target === lastTarget) return;
      lastTarget = target;

      const interactive = target?.closest(
        "a, button, [data-cursor], [role='button'], input, textarea, select, [data-cursor-label]"
      ) as HTMLElement | null;

      if (interactive) {
        const customVariant = interactive.dataset.cursor as
          | CursorVariant
          | undefined;
        setVariant(customVariant || "hover");
        setLabel(interactive.dataset.cursorLabel || "");
      } else {
        setVariant("default");
        setLabel("");
      }
    };

    let visible = false;
    const setVisible = (next: boolean) => {
      if (visible === next) return;
      visible = next;
      setIsVisible(next);
    };

    const move = (e: MouseEvent) => {
      // Motion values write straight to the transform without a React render.
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setVisible(true);

      pendingTarget = e.target as HTMLElement;
      if (!rafId) rafId = requestAnimationFrame(resolveTarget);
    };

    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, [cursorX, cursorY, isTouch]);

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
      {/* Dot — instant follow.
          Colors live in CSS classes rather than `animate` so they resolve from
          the active daisyUI theme; Framer only drives geometry and opacity. */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block"
        style={{ x: cursorX, y: cursorY }}
      >
        <motion.div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-150 ${
            variant === "default" ? "bg-primary" : "bg-transparent"
          }`}
          animate={{
            width: variant === "text" ? 2 : 6,
            height: variant === "text" ? 24 : 6,
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
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center font-mono-display text-[9px] uppercase tracking-widest text-primary transition-colors duration-150 ${
            variant === "default"
              ? "border-primary/40 bg-primary/0"
              : variant === "view"
                ? "border-primary/90 bg-primary/10"
                : "border-primary/90 bg-primary/5"
          }`}
          animate={{
            width: ringSize,
            height: ringSize,
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
