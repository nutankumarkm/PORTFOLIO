"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/** Built-in daisyUI themes enabled in globals.css, in picker order. */
export const THEMES = [
  "light",
  "dark",
  "corporate",
  "business",
  "nord",
  "winter",
  "night",
  "dracula",
  "synthwave",
  "sunset",
  "forest",
  "cyberpunk",
] as const;

export type Theme = (typeof THEMES)[number];

/** Themes that render as dark, used to pick icon/contrast treatments. */
export const DARK_THEMES: readonly Theme[] = [
  "dark",
  "business",
  "night",
  "dracula",
  "synthwave",
  "sunset",
  "forest",
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      themes={[...THEMES]}
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
