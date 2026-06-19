"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillGroups, accentHex, type AccentColor } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { MorphBlob } from "./MorphBlob";

export function Skills() {
  const [active, setActive] = useState(0);
  const current = skillGroups[active];
  const currentColor = accentHex[current.color as AccentColor];

  // Coordinates helper
  const cx = 170;
  const cy = 170;
  const R = 105;
  const numAxes = 6;

  const getCoords = (index: number, r: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const getLabelCoords = (index: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    const isVertical = index === 0 || index === 3;
    const labelR = isVertical ? R + 22 : R + 26;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + (labelR - (isVertical ? 4 : 0)) * Math.sin(angle),
    };
  };

  // Base competency levels for KM Nutankumar (normalized 0-1)
  const BASE_LEVELS = [0.85, 0.95, 0.80, 0.85, 0.82, 0.88];

  // Calculate polygon points based on active index
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
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Decorative morph blobs */}
      <MorphBlob
        className="absolute top-20 right-10 w-[280px] h-[280px] opacity-10 pointer-events-none"
        color="#3afff0"
        duration={20}
      />
      <MorphBlob
        className="absolute bottom-32 left-0 w-[200px] h-[200px] opacity-8 pointer-events-none"
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

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center">
          {/* Left Column: Interactive Radar Web */}
          <div className="relative flex flex-col items-center justify-center bg-ink-950/20 border border-ink-600/30 rounded-3xl p-6 sm:p-8 overflow-hidden backdrop-blur-sm shadow-2xl min-h-[380px] sm:min-h-[420px]">
            {/* Morphing category background glow */}
            <div
              className="absolute inset-0 -z-10 transition-colors duration-700 blur-[80px] rounded-full opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${currentColor} 0%, transparent 70%)`,
              }}
            />

            {/* SVG Radar Map */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 340 340"
              className="max-w-[340px] max-h-[340px] select-none"
            >
              {/* Concentric Grid Hexagons */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, idx) => {
                const hexPoints = skillGroups
                  .map((_, i) => {
                    const { x, y } = getCoords(i, R * level);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ");
                return (
                  <polygon
                    key={`grid-${idx}`}
                    points={hexPoints}
                    className="stroke-ink-600/30 fill-none"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Radial Axis Lines */}
              {skillGroups.map((g, i) => {
                const outer = getCoords(i, R);
                const isSelected = i === active;
                return (
                  <g key={`axis-${g.id}`}>
                    {/* Faint default line */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={outer.x}
                      y2={outer.y}
                      className="stroke-ink-600/30"
                      strokeWidth={1}
                    />
                    {/* Glowing active line overlay */}
                    {isSelected && (
                      <motion.line
                        layoutId="activeAxis"
                        x1={cx}
                        y1={cy}
                        x2={outer.x}
                        y2={outer.y}
                        stroke={currentColor}
                        strokeWidth={2.5}
                        className="blur-[1px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Central Crosshair */}
              <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} className="stroke-ink-500/20" strokeWidth={1} />
              <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} className="stroke-ink-500/20" strokeWidth={1} />

              {/* Web Area Polygon (Morphing & Coloring) */}
              <motion.polygon
                points={pointsString}
                animate={{
                  points: pointsString,
                  fill: `${currentColor}1F`,
                  stroke: currentColor,
                }}
                transition={{
                  type: "spring",
                  stiffness: 70,
                  damping: 14,
                  mass: 0.8,
                }}
                strokeWidth={2}
                style={{
                  filter: `drop-shadow(0 0 8px ${currentColor}33)`,
                }}
              />

              {/* Category Outer Text Labels */}
              {skillGroups.map((g, i) => {
                const isSelected = i === active;
                const { x, y } = getLabelCoords(i);
                const groupColor = accentHex[g.color as AccentColor];

                let textAnchor: "start" | "middle" | "end" = "middle";
                if (i === 1 || i === 2) textAnchor = "start";
                else if (i === 4 || i === 5) textAnchor = "end";

                return (
                  <motion.text
                    key={`label-${g.id}`}
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    className="font-mono-display text-[9.5px] font-semibold tracking-wider transition-colors duration-300 cursor-pointer select-none outline-none"
                    animate={{
                      fill: isSelected ? groupColor : "var(--muted-foreground)",
                    }}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    style={{
                      textShadow: isSelected ? `0 0 10px ${groupColor}44` : "none",
                    }}
                    data-cursor="hover"
                  >
                    {g.label}
                  </motion.text>
                );
              })}

              {/* Node Vertex Dots */}
              {skillGroups.map((g, i) => {
                const isSelected = i === active;
                const level = isSelected ? 1.0 : BASE_LEVELS[i];
                const { x, y } = getCoords(i, R * level);
                const groupColor = accentHex[g.color as AccentColor];

                return (
                  <g key={`dot-${g.id}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={4}
                      className="cursor-pointer"
                      animate={{
                        fill: groupColor,
                        r: isSelected ? 5 : 3.5,
                      }}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setActive(i)}
                    />
                    {isSelected && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={8}
                        stroke={groupColor}
                        strokeWidth={1}
                        fill="none"
                        animate={{
                          scale: [1, 2.2, 1],
                          opacity: [0.8, 0, 0.8],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.2,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Invisible large hover detection areas */}
              {skillGroups.map((g, i) => {
                const outer = getCoords(i, R);
                return (
                  <circle
                    key={`hover-detect-${g.id}`}
                    cx={outer.x}
                    cy={outer.y}
                    r={32}
                    fill="transparent"
                    className="cursor-pointer outline-none select-none"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Right Column: Category Selection & Details Grid */}
          <div className="flex flex-col justify-start">
            {/* Pills */}
            <div className="flex flex-wrap gap-2">
              {skillGroups.map((g, i) => {
                const color = accentHex[g.color as AccentColor];
                const isActive = i === active;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    data-cursor="hover"
                    className="relative rounded-full border px-4 py-2 font-mono-display text-[11px] uppercase tracking-[0.18em] transition-all duration-300"
                    style={{
                      borderColor: isActive ? color : "var(--ink-600)",
                      color: isActive ? color : "var(--muted-foreground)",
                      backgroundColor: isActive ? `${color}14` : "transparent",
                      boxShadow: isActive ? `0 0 12px ${color}10` : "none",
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

            {/* Active skill group — tools grid */}
            <div className="mt-8 min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {current.items.map((item, i) => {
                    const color = accentHex[current.color as AccentColor];
                    return (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        whileHover={{ y: -4 }}
                        className="group relative rounded-xl border border-ink-600 bg-ink-800/50 p-4 overflow-hidden cursor-default transition-all duration-300 hover:border-ink-500"
                        data-cursor="hover"
                      >
                        <div
                          className="absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-2xl"
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
          </div>
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
