"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillGroups } from "@/lib/portfolio-data";
import { accent as accentClasses } from "@/lib/accent";
import { SectionHeading } from "./SectionHeading";
import { MorphBlob } from "./MorphBlob";

// Radar geometry
const CX = 170;
const CY = 170;
const R = 105;

/** Baseline competency per category, normalized 0–1. */
const BASE_LEVELS = [0.85, 0.95, 0.8, 0.85, 0.82, 0.88];

const getCoords = (index: number, r: number) => {
  const angle = (index * 60 - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
};

const getLabelCoords = (index: number) => {
  const angle = (index * 60 - 90) * (Math.PI / 180);
  const isVertical = index === 0 || index === 3;
  const labelR = isVertical ? R + 22 : R + 26;
  return {
    x: CX + labelR * Math.cos(angle),
    y: CY + (labelR - (isVertical ? 4 : 0)) * Math.sin(angle),
  };
};

export function Skills() {
  const [active, setActive] = useState(0);
  const current = skillGroups[active];
  const a = accentClasses(current.color);

  const pointsString = skillGroups
    .map((_, i) => {
      const level = i === active ? 1.0 : BASE_LEVELS[i];
      const { x, y } = getCoords(i, R * level);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <section
      id="skills"
      className="pointer-events-none relative overflow-hidden px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-0"
    >
      <MorphBlob
        className="pointer-events-none absolute right-10 top-20 h-[280px] w-[280px] opacity-10"
        color="var(--color-accent)"
        duration={20}
      />
      <MorphBlob
        className="pointer-events-none absolute bottom-32 left-0 h-[200px] w-[200px] opacity-[0.08]"
        color="var(--color-info)"
        duration={24}
      />

      <div className="pointer-events-auto relative mx-auto max-w-6xl">
        <SectionHeading index="03" eyebrow="Toolkit" title="Skills" accent="cyan" />

        <Marquee />

        <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Radar */}
          <div className="card relative min-h-[380px] items-center justify-center overflow-hidden border border-base-300 bg-base-200/45 p-6 shadow-xl backdrop-blur-md sm:min-h-[420px] sm:p-8">
            <div
              className={`pointer-events-none absolute inset-0 -z-10 rounded-full opacity-20 blur-[80px] transition-colors duration-700 ${a.bg}`}
            />

            <svg
              width="100%"
              height="100%"
              viewBox="0 0 340 340"
              className="max-h-[340px] max-w-[340px] select-none"
              role="img"
              aria-label={`Skill radar — ${current.label} selected`}
            >
              {/* Concentric grid */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => (
                <polygon
                  key={`grid-${idx}`}
                  points={skillGroups
                    .map((_, i) => {
                      const { x, y } = getCoords(i, R * level);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ")}
                  className="fill-none stroke-base-300/40"
                  strokeWidth={1}
                />
              ))}

              {/* Axes */}
              {skillGroups.map((g, i) => {
                const outer = getCoords(i, R);
                return (
                  <g key={`axis-${g.id}`}>
                    <line
                      x1={CX}
                      y1={CY}
                      x2={outer.x}
                      y2={outer.y}
                      className="stroke-base-300/40"
                      strokeWidth={1}
                    />
                    {i === active && (
                      <motion.line
                        layoutId="activeAxis"
                        x1={CX}
                        y1={CY}
                        x2={outer.x}
                        y2={outer.y}
                        className={`blur-[1px] ${a.stroke}`}
                        strokeWidth={2.5}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Crosshair */}
              <line x1={CX - 5} y1={CY} x2={CX + 5} y2={CY} className="stroke-base-300/30" strokeWidth={1} />
              <line x1={CX} y1={CY - 5} x2={CX} y2={CY + 5} className="stroke-base-300/30" strokeWidth={1} />

              {/* Competency polygon */}
              <motion.polygon
                points={pointsString}
                animate={{ points: pointsString }}
                transition={{ type: "spring", stiffness: 70, damping: 14, mass: 0.8 }}
                strokeWidth={2}
                className={`transition-colors duration-500 ${a.fill} ${a.stroke} opacity-90 [fill-opacity:0.12]`}
              />

              {/* Category labels */}
              {skillGroups.map((g, i) => {
                const { x, y } = getLabelCoords(i);
                const ga = accentClasses(g.color);
                let textAnchor: "start" | "middle" | "end" = "middle";
                if (i === 1 || i === 2) textAnchor = "start";
                else if (i === 4 || i === 5) textAnchor = "end";

                return (
                  <text
                    key={`label-${g.id}`}
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    className={`cursor-pointer select-none font-mono-display text-[9.5px] font-semibold tracking-wider outline-none transition-colors duration-300 ${
                      i === active ? ga.fill : "fill-base-content/50"
                    }`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    data-cursor="hover"
                  >
                    {g.label}
                  </text>
                );
              })}

              {/* Vertex dots */}
              {skillGroups.map((g, i) => {
                const isSelected = i === active;
                const level = isSelected ? 1.0 : BASE_LEVELS[i];
                const { x, y } = getCoords(i, R * level);
                const ga = accentClasses(g.color);

                return (
                  <g key={`dot-${g.id}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      className={`cursor-pointer ${ga.fill}`}
                      animate={{ r: isSelected ? 5 : 3.5 }}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setActive(i)}
                    />
                    {isSelected && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={8}
                        strokeWidth={1}
                        className={`fill-none ${ga.stroke}`}
                        animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Enlarged hit areas */}
              {skillGroups.map((g, i) => {
                const outer = getCoords(i, R);
                return (
                  <circle
                    key={`hit-${g.id}`}
                    cx={outer.x}
                    cy={outer.y}
                    r={32}
                    fill="transparent"
                    className="cursor-pointer select-none outline-none"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Category tabs + tool grid */}
          <div className="flex flex-col justify-start">
            <div
              role="tablist"
              aria-label="Skill categories"
              className="tabs tabs-box flex-wrap gap-1 bg-base-200/50 p-2 backdrop-blur-md"
            >
              {skillGroups.map((g, i) => {
                const ga = accentClasses(g.color);
                return (
                  <button
                    key={g.id}
                    role="tab"
                    aria-selected={i === active}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    data-cursor="hover"
                    className={`tab gap-2 font-mono-display text-[11px] uppercase tracking-[0.18em] ${
                      i === active ? "tab-active" : ""
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${ga.bg}`} />
                    {g.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  {current.items.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      whileHover={{ y: -4 }}
                      data-cursor="hover"
                      className="card card-sm group relative cursor-default overflow-hidden border border-base-300 bg-base-200/40 backdrop-blur-md transition-colors duration-300 hover:border-base-content/20 hover:bg-base-200/70"
                    >
                      <div
                        className={`absolute -right-12 -top-12 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-35 ${a.bg}`}
                      />
                      <div className="card-body relative gap-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-mono-display text-[10px] ${a.text}`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className={`h-1.5 w-1.5 rounded-full ${a.bg}`} />
                        </div>
                        <div className="font-display text-sm font-medium">{item}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="stats stats-vertical mt-16 w-full border border-base-300 bg-base-200/50 shadow-xl backdrop-blur-md sm:stats-horizontal"
        >
          {[
            { value: "6", label: "Categories", tone: "text-primary" },
            { value: "40+", label: "Tools & libs", tone: "text-accent" },
            { value: "7", label: "Languages", tone: "text-secondary" },
            { value: "4", label: "Domains", tone: "text-warning" },
          ].map((s) => (
            <div key={s.label} className="stat place-items-center">
              <div className={`stat-value font-display text-3xl font-bold ${s.tone}`}>
                {s.value}
              </div>
              <div className="stat-title mt-1 font-mono-display text-[10px] uppercase tracking-[0.18em]">
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
    <div className="mask-fade-edges relative mt-10 overflow-hidden border-y border-base-300 py-4">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{ animation: "marquee 40s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 font-display text-xl text-base-content/60 sm:text-2xl"
          >
            <span className="transition-colors hover:text-primary">{item}</span>
            <span className="text-primary/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
