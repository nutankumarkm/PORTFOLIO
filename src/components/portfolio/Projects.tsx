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
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section
      id="projects"
      className="relative lg:min-h-screen lg:flex lg:flex-col lg:justify-center py-20 lg:py-0 px-4 sm:px-6 lg:px-8 overflow-hidden"
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
            // Sandwich layout: First and last items are full width (lg:col-span-2)
            const featured = i === 0 || i === 3;
            
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={featured ? "lg:col-span-2" : ""}
              >

                <div className="group block h-full rounded-2xl overflow-hidden">
                  <TiltCard
                    max={6}
                    scale={1.015}
                    className="relative h-full rounded-2xl border border-ink-600 bg-ink-800/40 hover:border-ink-500 transition-colors duration-300"
                  >
                    {/* Project index watermark */}
                    <div
                      className="absolute -top-6 -right-2 font-display text-[120px] font-bold leading-none pointer-events-none select-none opacity-[0.04]"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div
                      className="relative p-6 md:p-8 flex flex-col h-full"
                      onMouseMove={handleMouseMove}
                    >
                      {/* Dynamic Spotlight Glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${color}20, transparent 80%)`,
                        }}
                      />

                      {/* Top meta row */}
                      <div className="relative z-10 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span
                            className="font-mono-display text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border bg-ink-900/40"
                            style={{ borderColor: `${color}40`, color }}
                          >
                            {p.year}
                          </span>
                          <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: color,
                              boxShadow: `0 0 10px ${color}`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Middle content row */}
                      <div className={`relative z-10 flex flex-col gap-6 ${featured ? "lg:flex-row lg:items-start" : ""}`}>
                        {/* Left block: Title, tagline, description */}
                        <div className={featured ? "lg:w-3/5" : "w-full"}>
                          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:text-lime transition-colors leading-tight">
                            {p.title}
                          </h3>
                          <p
                            className="mt-2 text-xs font-semibold tracking-wider uppercase font-mono-display"
                            style={{ color }}
                          >
                            {p.tagline}
                          </p>
                          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        {/* Right block: Metrics (if featured, side-by-side or column) */}
                        {featured ? (
                          <div className="lg:w-2/5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
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
                                <div className="mt-0.5 font-mono-display text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                                  {m.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Inline metrics for non-featured projects */
                          <div className="pt-4 border-t border-ink-600/60 flex items-center gap-6">
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

                      {/* Footer (Stack chips) */}
                      <div className="relative z-10 mt-8 pt-5 border-t border-ink-600/30 flex flex-wrap gap-1.5 mt-auto">
                        {p.stack.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-ink-600 bg-ink-900/40 px-2.5 py-1 font-mono-display text-[9px] uppercase tracking-[0.12em] text-muted-foreground group-hover:border-ink-500 transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
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
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
