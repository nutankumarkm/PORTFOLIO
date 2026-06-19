"use client";

import { motion } from "framer-motion";
import { experience, accentHex, type AccentColor } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";

const accentByIndex: AccentColor[] = ["lime", "cyan"];

export function Experience() {

  return (
    <section
      id="experience"
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div
        className="absolute top-10 left-0 font-display text-[18vw] font-bold text-foreground/[0.02] leading-none pointer-events-none select-none"
        aria-hidden
      >
        WORK
      </div>

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          index="04"
          eyebrow="Trajectory"
          title="Experience"
          accent="magenta"
        />

        <div className="mt-16 relative">
          {/* Vertical rail */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-ink-600 to-transparent" />

          <div className="space-y-12 md:space-y-24">
            {experience.map((job, idx) => {
              const accent = accentByIndex[idx % accentByIndex.length];
              const color = accentHex[accent];
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={job.company}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 pl-10 md:pl-0`}
                >
                  {/* Rail node */}
                  <div className="absolute left-0 md:left-1/2 top-2 -translate-x-1/2 z-10">
                    <div className="relative">
                      <motion.div
                        className="h-4 w-4 rounded-full border-2"
                        style={{ borderColor: color, backgroundColor: "var(--ink-900)" }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full"
                        style={{ border: `1px solid ${color}` }}
                        animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className={isLeft ? "md:block" : "md:order-2"} />

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className={`group relative rounded-2xl border border-ink-600 bg-ink-800/50 p-6 md:p-8 hover:border-ink-500 transition-colors ${
                      isLeft ? "md:col-start-1 md:text-right" : "md:col-start-2"
                    }`}
                  >
                    {/* Accent strip */}
                    <div
                      className="absolute top-0 left-0 h-full w-[3px] rounded-l-2xl"
                      style={{
                        background: `linear-gradient(to bottom, ${color}, transparent)`,
                      }}
                    />

                    <div className={`flex items-center gap-3 mb-3 ${isLeft ? "md:justify-end" : ""}`}>
                      <span
                        className="font-mono-display text-[10px] uppercase tracking-[0.25em] px-2 py-1 rounded-full border"
                        style={{ borderColor: `${color}40`, color }}
                      >
                        {job.period}
                      </span>
                      <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {job.location}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {job.role}
                    </h3>
                    <div className="font-mono-display text-sm mt-1" style={{ color }}>
                      {job.company}
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {job.summary}
                    </p>

                    <ul className={`mt-5 space-y-2.5 ${isLeft ? "md:text-left" : ""}`}>
                      {job.bullets.map((b, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-sm text-foreground/80 leading-relaxed"
                        >
                          <span
                            className="mt-1.5 h-1 w-1 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Stack chips */}
                    <div className={`mt-6 flex flex-wrap gap-2 ${isLeft ? "md:justify-end" : ""}`}>
                      {job.stack.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-ink-600 px-2.5 py-1 font-mono-display text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
