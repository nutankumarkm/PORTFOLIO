"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { experience, accentHex, type AccentColor } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";

const accentByIndex: AccentColor[] = ["lime", "cyan"];

export function Experience() {
  const [activeTab, setActiveTab] = useState(0);

  const activeJob = experience[activeTab];
  const accent = accentByIndex[activeTab % accentByIndex.length];
  const color = accentHex[accent];

  return (
    <section
      id="experience"
      className="relative lg:min-h-screen lg:flex lg:flex-col lg:justify-center py-20 lg:py-0 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div
        className="absolute top-10 left-0 font-display text-[18vw] font-bold text-foreground/[0.02] leading-none pointer-events-none select-none"
        aria-hidden
      >
        WORK
      </div>

      <div className="relative mx-auto max-w-5xl w-full">
        <SectionHeading
          index="04"
          eyebrow="Trajectory"
          title="Experience"
          accent="magenta"
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-12 items-start">
          {/* Tabs Column */}
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-l border-ink-600/50 pb-2 md:pb-0 md:pl-0 flex-shrink-0">
            {experience.map((job, idx) => {
              const isActive = activeTab === idx;
              const tabAccent = accentByIndex[idx % accentByIndex.length];
              const tabColor = accentHex[tabAccent];
              return (
                <button
                  key={job.company}
                  onClick={() => setActiveTab(idx)}
                  data-cursor="hover"
                  className="relative text-left px-5 py-3 font-mono-display text-xs uppercase tracking-wider whitespace-nowrap transition-colors duration-300 w-full"
                  style={{
                    color: isActive ? tabColor : "var(--muted-foreground)",
                  }}
                >
                  {/* Left sliding border indicator on desktop */}
                  {isActive && (
                    <motion.div
                      layoutId="active-exp-bar"
                      className="absolute left-0 top-0 bottom-0 w-[2px] hidden md:block"
                      style={{ backgroundColor: tabColor }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {/* Bottom sliding border indicator on mobile */}
                  {isActive && (
                    <motion.div
                      layoutId="active-exp-bar-mobile"
                      className="absolute bottom-0 left-0 right-0 h-[2px] md:hidden"
                      style={{ backgroundColor: tabColor }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {job.company}
                </button>
              );
            })}
          </div>

          {/* Job Content Column */}
          <div className="min-h-[420px] relative w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl border border-ink-600 bg-ink-800/50 p-6 md:p-8 hover:border-ink-500 transition-colors w-full"
              >
                {/* Accent strip */}
                <div
                  className="absolute top-0 left-0 h-full w-[3px] rounded-l-2xl"
                  style={{
                    background: `linear-gradient(to bottom, ${color}, transparent)`,
                  }}
                />

                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="font-mono-display text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border bg-ink-900/40"
                    style={{ borderColor: `${color}40`, color }}
                  >
                    {activeJob.period}
                  </span>
                  <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {activeJob.location}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-foreground">
                  {activeJob.role}
                </h3>
                <div className="font-mono-display text-sm mt-1 font-semibold" style={{ color }}>
                  {activeJob.company}
                </div>

                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {activeJob.summary}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {activeJob.bullets.map((b, i) => (
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
                <div className="mt-6 flex flex-wrap gap-2">
                  {activeJob.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-ink-600 px-2.5 py-1 font-mono-display text-[10px] uppercase tracking-[0.15em] text-muted-foreground bg-ink-900/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
