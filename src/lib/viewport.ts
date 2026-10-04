"use client";

import { useSyncExternalStore } from "react";

/**
 * Below this width the 3D backdrop is skipped and the page falls back to its
 * CSS styling. Kept in its own module so the page can make that call *before*
 * asking for the scene — importing it from Scene3D would pull three.js into the
 * main bundle and defeat the dynamic import.
 */
const MOBILE_QUERY = "(max-width: 767px)";

/* Viewport check as an external store — no effect, no setState-on-mount. */
const subscribeMobile = (onChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getMobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

/**
 * True on phone-sized viewports. Reads `null` on the server and during
 * hydration, so callers can render nothing until the real answer is known
 * rather than guessing one way and flipping.
 */
export function useIsMobileViewport(): boolean | null {
  return useSyncExternalStore<boolean | null>(
    subscribeMobile,
    getMobileSnapshot,
    () => null
  );
}
