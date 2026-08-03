import type { AccentColor } from "./portfolio-data";

/**
 * The content layer names accents after the old brand palette
 * (lime/cyan/magenta/amber/violet). Map each onto a daisyUI semantic color so
 * accents follow whichever theme the visitor picked, instead of being frozen
 * to one palette.
 */
export type DaisyAccent = "primary" | "accent" | "secondary" | "warning" | "info";

export const accentOf: Record<AccentColor, DaisyAccent> = {
  lime: "primary",
  cyan: "accent",
  magenta: "secondary",
  amber: "warning",
  violet: "info",
};

interface AccentClassSet {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  badge: string;
  progress: string;
  ring: string;
  /** SVG paint utilities — `fill="var(--x)"` does not resolve as an
   *  attribute, so SVG colors must come from generated CSS classes. */
  fill: string;
  stroke: string;
  /** Raw CSS custom property, for `style` props and canvas/WebGL. */
  cssVar: string;
}

/** Pre-composed class strings — Tailwind needs literal names to generate CSS. */
export const accentClasses: Record<DaisyAccent, AccentClassSet> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary",
    bgSoft: "bg-primary/10",
    border: "border-primary/40",
    badge: "badge-primary",
    progress: "progress-primary",
    ring: "ring-primary/30",
    fill: "fill-primary",
    stroke: "stroke-primary",
    cssVar: "var(--color-primary)",
  },
  secondary: {
    text: "text-secondary",
    bg: "bg-secondary",
    bgSoft: "bg-secondary/10",
    border: "border-secondary/40",
    badge: "badge-secondary",
    progress: "progress-secondary",
    ring: "ring-secondary/30",
    fill: "fill-secondary",
    stroke: "stroke-secondary",
    cssVar: "var(--color-secondary)",
  },
  accent: {
    text: "text-accent",
    bg: "bg-accent",
    bgSoft: "bg-accent/10",
    border: "border-accent/40",
    badge: "badge-accent",
    progress: "progress-accent",
    ring: "ring-accent/30",
    fill: "fill-accent",
    stroke: "stroke-accent",
    cssVar: "var(--color-accent)",
  },
  info: {
    text: "text-info",
    bg: "bg-info",
    bgSoft: "bg-info/10",
    border: "border-info/40",
    badge: "badge-info",
    progress: "progress-info",
    ring: "ring-info/30",
    fill: "fill-info",
    stroke: "stroke-info",
    cssVar: "var(--color-info)",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning",
    bgSoft: "bg-warning/10",
    border: "border-warning/40",
    badge: "badge-warning",
    progress: "progress-warning",
    ring: "ring-warning/30",
    fill: "fill-warning",
    stroke: "stroke-warning",
    cssVar: "var(--color-warning)",
  },
};

/** Resolve a content-layer accent name to its daisyUI class set. */
export function accent(name: string) {
  return accentClasses[accentOf[(name as AccentColor)] ?? "primary"];
}
