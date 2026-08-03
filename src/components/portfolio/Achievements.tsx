"use client";

import { motion } from "framer-motion";
import { achievements } from "@/lib/portfolio-data";
import { accent as accentClasses } from "@/lib/accent";

export function Achievements() {
  return (
    <section
      id="achievements"
      className="relative px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-0"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <span className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-warning">
            Honors
          </span>
          <span className="h-px flex-1 bg-base-300" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {achievements.map((item, i) => {
            const a = accentClasses(item.accent);
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                data-cursor="hover"
                className="card group relative overflow-hidden border border-base-300 bg-base-200/40 backdrop-blur-md transition-all duration-300 hover:border-base-content/20 hover:shadow-2xl"
              >
                {/* Decorative orb */}
                <motion.div
                  className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-30 blur-2xl ${a.bg}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="card-body relative flex-row items-start gap-4">
                  {/* Rotating star */}
                  <motion.svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    className="mt-1 shrink-0"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    aria-hidden
                  >
                    <path
                      d="M18 4 L22 14 L32 14 L24 21 L27 32 L18 25 L9 32 L12 21 L4 14 L14 14 Z"
                      strokeWidth="1"
                      className={`${a.stroke} ${a.fill} [fill-opacity:0.13]`}
                    />
                  </motion.svg>

                  <div className="flex-1">
                    <div
                      className={`badge badge-outline badge-sm mb-2 font-mono-display text-[10px] uppercase tracking-[0.2em] ${a.text}`}
                    >
                      {item.badge}
                    </div>
                    <h3 className="card-title font-display text-lg font-bold">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-base-content/70">
                      {item.description}
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
