"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

// Track mount state without calling setState in an effect (lint-safe).
const emptySubscribe = () => () => {};
const getMounted = () => true;
const getMountedServer = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getMounted,
    getMountedServer
  );

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const toggle = () => setTheme(isDark ? "light" : "dark");

  // Sun ray paths — 8 rays around a central disc
  const sunRays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 360) / 8;
    return { angle, x: Math.cos((angle * Math.PI) / 180) * 14 };
  });

  return (
    <button
      onClick={toggle}
      data-cursor="hover"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative h-9 w-9 rounded-full border border-hairline bg-surface-2/60 flex items-center justify-center overflow-hidden hover:border-lime/50 transition-colors"
    >
      <motion.div
        className="relative h-4 w-4"
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <motion.path
                d="M14 8.5 A 6 6 0 1 1 7.5 2 A 4.5 4.5 0 0 0 14 8.5 Z"
                fill="var(--lime)"
                animate={{
                  d: [
                    "M14 8.5 A 6 6 0 1 1 7.5 2 A 4.5 4.5 0 0 0 14 8.5 Z",
                    "M14 8.5 A 6 6 0 1 1 7.5 2 A 4.5 4.5 0 0 0 14 8.5 Z",
                  ],
                }}
                transition={{ duration: 0.4 }}
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <motion.circle
                cx="8"
                cy="8"
                r="3.2"
                fill="var(--amber)"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {sunRays.map((ray, i) => (
                <motion.line
                  key={i}
                  x1="8"
                  y1="1.5"
                  x2="8"
                  y2="3.5"
                  stroke="var(--amber)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  style={{
                    transformOrigin: "8px 8px",
                    transform: `rotate(${ray.angle}deg)`,
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.08,
                  }}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Subtle hover halo */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDark
            ? "0 0 0 0px color-mix(in oklch, var(--lime) 30%, transparent)"
            : "0 0 0 0px color-mix(in oklch, var(--amber) 30%, transparent)",
        }}
        whileHover={{
          boxShadow: isDark
            ? "0 0 0 4px color-mix(in oklch, var(--lime) 15%, transparent)"
            : "0 0 0 4px color-mix(in oklch, var(--amber) 15%, transparent)",
        }}
      />
    </button>
  );
}
