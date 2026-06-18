"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillGroups, accentHex, type AccentColor } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { MorphBlob } from "./MorphBlob";

export function Skills() {
  const [active, setActive] = useState(0);
  const current = skillGroups[active];

  return (
    <section
      id="skills"
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Decorative morph blobs */}
      <MorphBlob
        className="absolute top-20 right-10 w-[280px] h-[280px] opacity-20 pointer-events-none"
        color="#3afff0"
        duration={20}
      />
      <MorphBlob
        className="absolute bottom-32 left-0 w-[200px] h-[200px] opacity-15 pointer-events-none"
        color="#b988ff"
        duration={24}
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          index="03"
          eyebrow="Toolkit"
          title="Skills"
          accent="cyan"
        />

        {/* Marquee of all tech names */}
        <Marquee />

        {/* Category pills */}
        <div className="mt-12 flex flex-wrap gap-2.5">
          {skillGroups.map((g, i) => {
            const color = accentHex[g.color as AccentColor];
            const isActive = i === active;
            return (
              <button
                key={g.id}
                onClick={() => setActive(i)}
                data-cursor="hover"
                className="relative rounded-full border px-4 py-2 font-mono-display text-[11px] uppercase tracking-[0.18em] transition-colors"
                style={{
                  borderColor: isActive ? color : "var(--ink-600)",
                  color: isActive ? color : "var(--muted-foreground)",
                  backgroundColor: isActive ? `${color}14` : "transparent",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: isActive ? `0 0 8px ${color}` : "none",
                    }}
                  />
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active skill group — morphing grid */}
        <div className="mt-10 min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {current.items.map((item, i) => {
                const color = accentHex[current.color as AccentColor];
                return (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    className="group relative rounded-xl border border-ink-600 bg-ink-800/50 p-4 overflow-hidden cursor-default"
                    data-cursor="hover"
                  >
                    <div
                      className="absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-0 group-hover:opacity-40 transition-opacity blur-2xl"
                      style={{ background: color }}
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="font-mono-display text-[10px]"
                          style={{ color }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <div className="font-display text-sm font-medium text-foreground">
                        {item}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-600/40 border border-ink-600/40 rounded-2xl overflow-hidden"
        >
          {[
            { value: "6", label: "Categories", color: "var(--lime)" },
            { value: "40+", label: "Tools & libs", color: "var(--cyan)" },
            { value: "7", label: "Languages", color: "var(--magenta)" },
            { value: "4", label: "Domains", color: "var(--amber)" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-ink-900 p-5 flex flex-col items-center text-center"
            >
              <div
                className="font-display text-3xl font-bold"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="mt-1 font-mono-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Python",
    "LangChain",
    "LLaMA 3",
    "Mistral",
    "RAG",
    "Flutter",
    "HuggingFace",
    "PEFT",
    "LoRA",
    "MCP",
    "Vector DB",
    "OpenCV",
    "Docker",
    "ZeroMQ",
    "Raft",
    "Firebase",
    "MongoDB",
    "TypeScript",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="mt-10 relative overflow-hidden border-y border-ink-600 py-4 mask-fade-edges">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: "marquee 40s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 font-display text-xl sm:text-2xl text-muted-foreground/70"
          >
            <span className="hover:text-lime transition-colors">{item}</span>
            <span className="text-lime/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
