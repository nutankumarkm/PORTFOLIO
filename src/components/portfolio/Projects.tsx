"use client";

import { motion } from "framer-motion";
import { projects } from "@/lib/portfolio-data";
import { accent as accentClasses } from "@/lib/accent";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

export function Projects() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      id="projects"
      className="pointer-events-none relative overflow-hidden px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-0"
    >
      <div
        className="pointer-events-none absolute right-0 top-10 select-none font-display text-[18vw] font-bold leading-none text-base-content/[0.02]"
        aria-hidden
      >
        WORK
      </div>

      <div className="pointer-events-auto relative mx-auto max-w-6xl">
        <SectionHeading index="05" eyebrow="Selected" title="Projects" accent="amber" />

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((p, i) => {
            const a = accentClasses(p.accent);
            // Sandwich layout: first and last span the full width.
            const featured = i === 0 || i === projects.length - 1;

            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={featured ? "lg:col-span-2" : ""}
              >
                <div className="group block h-full">
                  <TiltCard
                    max={6}
                    scale={1.015}
                    className="card relative h-full overflow-hidden border border-base-300 bg-base-200/40 backdrop-blur-md transition-all duration-300 hover:border-base-content/20 hover:shadow-2xl"
                  >
                    {/* Index watermark */}
                    <div
                      className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[120px] font-bold leading-none opacity-[0.04]"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="card-body relative gap-0" onMouseMove={handleMouseMove}>
                      {/* Cursor spotlight */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background: `radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), color-mix(in oklch, ${a.cssVar} 18%, transparent), transparent 80%)`,
                        }}
                      />

                      {/* Meta row */}
                      <div className="relative z-10 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`badge badge-outline badge-sm font-mono-display text-[10px] uppercase tracking-[0.25em] ${a.text}`}
                          >
                            {p.year}
                          </span>
                          <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-base-content/60">
                            {String(i + 1).padStart(2, "0")} /{" "}
                            {String(projects.length).padStart(2, "0")}
                          </span>
                        </div>
                        <span className={`status status-md ${a.bg}`} aria-hidden />
                      </div>

                      {/* Body */}
                      <div
                        className={`relative z-10 flex flex-col gap-6 ${
                          featured ? "lg:flex-row lg:items-start" : ""
                        }`}
                      >
                        <div className={featured ? "lg:w-3/5" : "w-full"}>
                          <h3 className="card-title font-display text-2xl font-bold leading-tight transition-colors group-hover:text-primary md:text-3xl">
                            {p.title}
                          </h3>
                          <p
                            className={`mt-2 font-mono-display text-xs font-semibold uppercase tracking-wider ${a.text}`}
                          >
                            {p.tagline}
                          </p>
                          <p className="mt-4 text-sm leading-relaxed text-base-content/70">
                            {p.description}
                          </p>
                        </div>

                        {featured ? (
                          <div className="stats stats-vertical border border-base-300 bg-base-100/50 sm:stats-horizontal lg:w-2/5 lg:stats-vertical">
                            {p.metrics.map((m) => (
                              <div key={m.label} className="stat">
                                <div
                                  className={`stat-value font-display text-xl font-bold ${a.text}`}
                                >
                                  {m.value}
                                </div>
                                <div className="stat-title font-mono-display text-[9px] uppercase tracking-[0.15em]">
                                  {m.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-6 border-t border-base-300/60 pt-4">
                            {p.metrics.map((m) => (
                              <div key={m.label}>
                                <div
                                  className={`font-display text-lg font-bold ${a.text}`}
                                >
                                  {m.value}
                                </div>
                                <div className="font-mono-display text-[9px] uppercase tracking-[0.15em] text-base-content/60">
                                  {m.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stack */}
                      <div className="card-actions relative z-10 mt-auto flex-wrap gap-1.5 border-t border-base-300/40 pt-5">
                        {p.stack.map((s) => (
                          <span
                            key={s}
                            className="badge badge-ghost badge-sm font-mono-display text-[9px] uppercase tracking-[0.12em]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Accent underline */}
                    <motion.div
                      className={`absolute bottom-0 left-0 h-[2px] ${a.bg}`}
                      initial={{ width: "0%" }}
                      whileInView={{ width: "30%" }}
                      viewport={{ once: false }}
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
