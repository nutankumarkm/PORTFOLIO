"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Palette } from "lucide-react";
import { THEMES, DARK_THEMES, type Theme } from "./ThemeProvider";

// Track mount state without calling setState in an effect (lint-safe).
const emptySubscribe = () => () => {};
const getMounted = () => true;
const getMountedServer = () => false;

/**
 * daisyUI theme picker. State lives in next-themes (so the choice persists
 * across reloads); daisyUI's nested `data-theme` support lets every row in the
 * menu render a live swatch of the theme it would apply.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getMounted,
    getMountedServer
  );

  const current = (mounted ? theme : "light") as Theme;

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        data-cursor="hover"
        aria-label="Change theme"
        className="btn btn-ghost btn-sm btn-circle sm:btn-block sm:w-auto sm:px-3 sm:rounded-full"
      >
        <Palette className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline font-mono-display text-[10px] uppercase tracking-[0.18em]">
          {current}
        </span>
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu menu-sm z-[120] mt-3 max-h-[70vh] w-52 flex-nowrap overflow-y-auto rounded-box bg-base-200 p-2 shadow-lg ring-1 ring-base-300"
      >
        <li className="menu-title font-mono-display text-[10px] uppercase tracking-[0.2em]">
          Theme
        </li>
        {THEMES.map((t) => (
          <li key={t}>
            <button
              onClick={() => setTheme(t)}
              data-cursor="hover"
              aria-current={current === t}
              className={current === t ? "menu-active" : undefined}
            >
              {/* Swatch renders in its own theme, previewing the palette. */}
              <span
                data-theme={t}
                className="flex shrink-0 gap-0.5 rounded-badge bg-base-100 p-1 ring-1 ring-base-300"
              >
                <span className="h-3 w-1 rounded-full bg-primary" />
                <span className="h-3 w-1 rounded-full bg-secondary" />
                <span className="h-3 w-1 rounded-full bg-accent" />
                <span className="h-3 w-1 rounded-full bg-neutral" />
              </span>
              <span className="flex-1 truncate capitalize">{t}</span>
              {DARK_THEMES.includes(t) && (
                <span className="badge badge-ghost badge-xs font-mono-display">
                  dark
                </span>
              )}
              {current === t && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
