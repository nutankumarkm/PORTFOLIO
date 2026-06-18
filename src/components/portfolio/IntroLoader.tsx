"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroLoader() {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink-900"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              fill="none"
              className="absolute"
            >
              <motion.path
                d="M110 20 C 160 30, 195 70, 195 110 C 195 160, 150 200, 110 200 C 70 200, 25 165, 25 110 C 25 65, 65 30, 110 20 Z"
                stroke="rgba(212,255,58,0.25)"
                strokeWidth="1"
                fill="none"
                animate={{
                  d: [
                    "M110 20 C 160 30, 195 70, 195 110 C 195 160, 150 200, 110 200 C 70 200, 25 165, 25 110 C 25 65, 65 30, 110 20 Z",
                    "M110 25 C 170 40, 200 90, 185 130 C 175 175, 140 195, 105 200 C 60 205, 30 165, 30 115 C 30 70, 65 25, 110 25 Z",
                    "M110 20 C 160 30, 195 70, 195 110 C 195 160, 150 200, 110 200 C 70 200, 25 165, 25 110 C 25 65, 65 30, 110 20 Z",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx="110"
                cy="110"
                r="50"
                stroke="rgba(212,255,58,0.9)"
                strokeWidth="1.5"
                fill="none"
                animate={{ r: [50, 56, 50], opacity: [0.9, 0.5, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>

            <motion.div
              className="font-mono-display text-[14px] tracking-[0.4em] text-lime"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              LOADING
            </motion.div>
          </motion.div>

          <div className="mt-12 w-[min(80vw,360px)]">
            <div className="mb-2 flex items-end justify-between font-mono-display text-[11px] tracking-widest text-muted-foreground">
              <span>NUTANKUMAR.KM</span>
              <span className="text-lime">{count.toString().padStart(3, "0")}%</span>
            </div>
            <div className="h-px w-full bg-ink-600 overflow-hidden">
              <motion.div
                className="h-full bg-lime origin-left"
                style={{ width: `${count}%` }}
              />
            </div>
            <motion.div
              className="mt-3 text-center font-mono-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              Compiling portfolio —
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
