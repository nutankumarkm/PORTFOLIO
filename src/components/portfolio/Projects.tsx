"use client";

import { motion } from "framer-motion";
import {
  projects,
  accentHex,
  type AccentColor,
} from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

export function Projects() {
  return (
    <section
      id="projects"
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div
        className="absolute top-10 right-0 font-display text-[18vw] font-bold text-foreground/[0.02] leading-none pointer-events-none select-none"
        aria-hidden
      >
        WORK
      </div>

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          index="05"
          eyebrow="Selected"
          title="Projects"
          accent="amber"
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((p, i) => {
            const color = accentHex[p.accent as AccentColor];
            const featured = i === 0;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={featured ? "lg:col-span-2" : ""}
              >
                <TiltCard
                  max={6}
                  scale={1.015}
                  className="group relative h-full rounded-2xl border border-ink-600 bg-ink-800/40 overflow-hidden hover:border-ink-500 transition-colors"
                >
                  {/* Project index watermark */}
                  <div
                    className="absolute -top-6 -right-2 font-display text-[120px] font-bold leading-none pointer-events-none select-none opacity-[0.04]"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Glow halo on hover */}
                  <div
                    className="absolute -inset-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-3xl pointer-events-none"
                    style={{ background: color }}
                  />

                  <div
                    className={`relative p-6 md:p-8 flex flex-col h-full ${
                      featured ? "md:flex-row md:gap-10" : ""
                    }`}
                  >
                    {/* Top meta */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono-display text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border"
                          style={{ borderColor: `${color}40`, color }}
                        >
                          {p.year}
                        </span>
                        <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                        </span>
                      </div>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 10px ${color}`,
                        }}
                      />
                    </div>

                    {/* Title + tagline */}
                    <div className={featured ? "md:w-1/2" : ""}>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:text-lime transition-colors">
                        {p.title}
                      </h3>
                      <p
                        className="mt-2 text-sm font-medium"
                        style={{ color }}
                      >
                        {p.tagline}
                      </p>
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Metrics — featured only shows on side */}
                    {featured && (
                      <div className="md:w-1/2 mt-6 md:mt-0 flex md:flex-col gap-3 md:justify-center">
                        {p.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="flex-1 rounded-xl border border-ink-600 bg-ink-900/60 p-4"
                          >
                            <div
                              className="font-display text-xl font-bold"
                              style={{ color }}
                            >
                              {m.value}
                            </div>
                            <div className="mt-0.5 font-mono-display text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stack chips */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.stack.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-ink-600 bg-ink-900/40 px-2.5 py-1 font-mono-display text-[10px] uppercase tracking-[0.12em] text-muted-foreground group-hover:border-ink-500 transition-colors"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Non-featured inline metrics */}
                    {!featured && (
                      <div className="mt-5 pt-5 border-t border-ink-600 flex items-center gap-6">
                        {p.metrics.map((m) => (
                          <div key={m.label}>
                            <div
                              className="font-display text-lg font-bold"
                              style={{ color }}
                            >
                              {m.value}
                            </div>
                            <div className="font-mono-display text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom accent bar that morphs on hover */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2px]"
                    style={{ background: color }}
                    initial={{ width: "0%" }}
                    whileInView={{ width: "30%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  />
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
