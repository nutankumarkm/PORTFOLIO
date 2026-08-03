"use client";

import { motion } from "framer-motion";
import { accent as accentClasses } from "@/lib/accent";
import type { AccentColor } from "@/lib/portfolio-data";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  accent?: AccentColor;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  accent = "lime",
}: SectionHeadingProps) {
  const a = accentClasses(accent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-4">
        <span className={`font-mono-display text-[11px] tracking-[0.3em] ${a.text}`}>
          {index}
        </span>
        <span className="h-px max-w-[80px] flex-1 bg-base-300" />
        <span
          className={`font-mono-display text-[11px] uppercase tracking-[0.3em] ${a.text}`}
        >
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
        {title}
      </h2>
    </motion.div>
  );
}
