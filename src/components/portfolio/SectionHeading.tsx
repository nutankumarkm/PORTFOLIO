"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  accent?: "lime" | "cyan" | "magenta" | "amber" | "violet";
}

const accentColor: Record<string, string> = {
  lime: "var(--lime)",
  cyan: "var(--cyan)",
  magenta: "var(--magenta)",
  amber: "var(--amber)",
  violet: "var(--violet)",
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  accent = "lime",
}: SectionHeadingProps) {
  const color = accentColor[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-4">
        <span
          className="font-mono-display text-[11px] tracking-[0.3em]"
          style={{ color }}
        >
          {index}
        </span>
        <span className="h-px flex-1 bg-ink-600 max-w-[80px]" />
        <span
          className="font-mono-display text-[11px] uppercase tracking-[0.3em]"
          style={{ color }}
        >
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
        {title}
      </h2>
    </motion.div>
  );
}
