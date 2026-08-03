"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { experience, type AccentColor } from "@/lib/portfolio-data";
import { accent as accentClasses } from "@/lib/accent";
import { SectionHeading } from "./SectionHeading";

const accentByIndex: AccentColor[] = ["lime", "cyan"];

export function Experience() {
  const [active, setActive] = useState(0);
  const job = experience[active];
  const a = accentClasses(accentByIndex[active % accentByIndex.length]);

  return (
    <section
      id="experience"
      className="relative overflow-hidden px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-0"
    >
      <div
        className="pointer-events-none absolute left-0 top-10 select-none font-display text-[18vw] font-bold leading-none text-base-content/[0.02]"
        aria-hidden
      >
        WORK
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <SectionHeading
          index="04"
          eyebrow="Trajectory"
          title="Experience"
          accent="magenta"
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* Company selector */}
          <div
            role="tablist"
            aria-label="Roles"
            className="tabs tabs-box h-fit gap-1 bg-base-200/50 p-2 backdrop-blur-md max-lg:tabs-sm lg:flex-col lg:items-stretch"
          >
            {experience.map((item, i) => {
              const ia = accentClasses(accentByIndex[i % accentByIndex.length]);
              return (
                <button
                  key={item.company}
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  data-cursor="hover"
                  className={`tab h-auto flex-col items-start gap-1 py-3 text-left ${
                    active === i ? "tab-active" : ""
                  }`}
                >
                  <span
                    className={`font-mono-display text-[10px] uppercase tracking-[0.2em] ${
                      active === i ? ia.text : "text-base-content/50"
                    }`}
                  >
                    {item.period}
                  </span>
                  <span className="font-display text-sm font-semibold">
                    {item.company}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={job.company}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              role="tabpanel"
              className="card relative overflow-hidden border border-base-300 bg-base-200/40 backdrop-blur-md"
            >
              {/* Accent strip */}
              <span
                className={`absolute inset-y-0 left-0 w-[3px] ${a.bg} opacity-70`}
                aria-hidden
              />

              <div className="card-body gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`badge badge-outline font-mono-display text-[10px] uppercase tracking-[0.25em] ${a.text}`}
                  >
                    {job.period}
                  </span>
                  <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-base-content/60">
                    {job.location}
                  </span>
                </div>

                <div>
                  <h3 className="card-title font-display text-2xl">{job.role}</h3>
                  <div className={`mt-1 font-mono-display text-sm ${a.text}`}>
                    {job.company}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-base-content/70">
                  {job.summary}
                </p>

                <ul className="space-y-2.5">
                  {job.bullets.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                      className="flex gap-2.5 text-sm leading-relaxed text-base-content/80"
                    >
                      <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${a.bg}`} />
                      <span>{b}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="card-actions mt-2 flex-wrap gap-2">
                  {job.stack.map((s) => (
                    <span
                      key={s}
                      className="badge badge-ghost badge-sm font-mono-display text-[10px] uppercase tracking-[0.15em]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
