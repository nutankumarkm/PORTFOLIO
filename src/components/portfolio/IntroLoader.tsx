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
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-base-100"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative flex flex-col items-center justify-center">
            <div
              className="radial-progress text-primary transition-all duration-75"
              style={
                {
                  "--value": count,
                  "--size": "10rem",
                  "--thickness": "2.5px",
                } as React.CSSProperties
              }
              role="progressbar"
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Loading portfolio"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-display text-3xl font-extrabold tracking-wider text-primary"
              >
                NK
              </motion.span>
            </div>

            <div className="mt-8 flex select-none flex-col items-center gap-1.5 text-center">
              <span className="font-mono-display text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                Initializing Portfolio
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-base-content/60">
                {count.toString().padStart(3, "0")}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
