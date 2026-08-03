"use client";

import { useSyncExternalStore } from "react";

/**
 * Bridges daisyUI's CSS theme tokens into WebGL.
 *
 * The 3D scene can't read `var(--color-primary)` — three.js needs a concrete
 * color, and daisyUI emits `oklch(...)` which THREE.Color cannot parse. So we
 * resolve each token to `#rrggbb` through a canvas (which understands the full
 * CSS Color 4 syntax) and re-read whenever the active theme changes.
 */

const TOKENS = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  accent: "--color-accent",
  base100: "--color-base-100",
  base200: "--color-base-200",
  base300: "--color-base-300",
  baseContent: "--color-base-content",
} as const;

type TokenKey = keyof typeof TOKENS;

export interface ThemeColors extends Record<TokenKey, string> {
  /** True when the active theme's page surface is dark. */
  isDark: boolean;
}

/** Used during SSR and before the first client read. Mirrors daisyUI `light`. */
const FALLBACK: ThemeColors = {
  primary: "#4f46e5",
  secondary: "#db2777",
  accent: "#14b8a6",
  base100: "#ffffff",
  base200: "#f8fafc",
  base300: "#e2e8f0",
  baseContent: "#0f172a",
  isDark: false,
};

let probe: CanvasRenderingContext2D | null | undefined;

function getProbe() {
  if (probe === undefined) {
    probe =
      document.createElement("canvas").getContext("2d", {
        willReadFrequently: true,
      }) ?? null;
  }
  return probe;
}

/** Resolve any CSS color string — including `oklch()` — to `#rrggbb`. */
export function cssColorToHex(value: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const input = value.trim();
  if (!input) return fallback;

  const ctx = getProbe();
  if (!ctx) return fallback;

  try {
    // The fillStyle setter silently ignores unparseable colors, so seed it with
    // two different sentinels: only a valid color overwrites both identically.
    ctx.fillStyle = "#000000";
    ctx.fillStyle = input;
    const fromBlack = ctx.fillStyle;

    ctx.fillStyle = "#ffffff";
    ctx.fillStyle = input;
    if (ctx.fillStyle !== fromBlack) return fallback;

    // Serialization varies by browser for wide-gamut syntax, so rasterize a
    // pixel and read back plain sRGB bytes.
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")}`;
  } catch {
    return fallback;
  }
}

function isDarkHex(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

/* --- Shared store: one observer and one read for all consumers ------------ */

let current: ThemeColors = FALLBACK;
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function read() {
  const styles = getComputedStyle(document.documentElement);
  const swatch = {} as Record<TokenKey, string>;
  (Object.keys(TOKENS) as TokenKey[]).forEach((key) => {
    swatch[key] = cssColorToHex(
      styles.getPropertyValue(TOKENS[key]),
      FALLBACK[key]
    );
  });

  const next: ThemeColors = { ...swatch, isDark: isDarkHex(swatch.base100) };

  // Keep the snapshot referentially stable so useSyncExternalStore doesn't
  // re-render every consumer on unrelated attribute mutations.
  const changed = (Object.keys(next) as (keyof ThemeColors)[]).some(
    (key) => next[key] !== current[key]
  );
  if (!changed) return;

  current = next;
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  if (!observer) {
    read();
    observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

/** Live daisyUI theme colors, resolved to hex for three.js. */
export function useThemeColors(): ThemeColors {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => FALLBACK
  );
}
