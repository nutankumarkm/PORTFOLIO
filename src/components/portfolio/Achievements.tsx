"use client";

import { motion } from "framer-motion";
import { achievements, accentHex, type AccentColor } from "@/lib/portfolio-data";

export function Achievements() {
  return (
    <section id="achievements" className="relative lg:min-h-screen lg:flex lg:flex-col lg:justify-center py-20 lg:py-0 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-amber">
            Honors
          </span>
          <span className="h-px flex-1 bg-ink-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((a, i) => {
            const color = accentHex[a.accent as AccentColor];
            return (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative rounded-2xl border border-ink-600 bg-gradient-to-br from-ink-800/60 to-ink-900 p-6 overflow-hidden"
                data-cursor="hover"
              >
                {/* Decorative orb */}
                <motion.div
                  className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-30"
                  style={{ background: color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative flex items-start gap-4">
                  {/* Trophy icon as morphing star */}
                  <div className="shrink-0 mt-1">
                    <motion.svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <motion.path
                        d="M18 4 L22 14 L32 14 L24 21 L27 32 L18 25 L9 32 L12 21 L4 14 L14 14 Z"
                        stroke={color}
                        strokeWidth="1"
                        fill={`${color}20`}
                      />
                    </motion.svg>
                  </div>

                  <div className="flex-1">
                    <div
                      className="font-mono-display text-[10px] uppercase tracking-[0.2em] mb-2 px-2 py-0.5 rounded-full border inline-block"
                      style={{ borderColor: `${color}40`, color }}
                    >
                      {a.badge}
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {a.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
