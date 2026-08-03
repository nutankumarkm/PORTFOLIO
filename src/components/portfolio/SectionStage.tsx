"use client";

import { useEffect, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

import { STAGE_SECTIONS, subscribeStageFrame } from "@/lib/scroll-stage";

interface SectionStageProps {
  /** Section id — resolves to the waypoint the 3D camera flies to. */
  id: string;
  children: ReactNode;
}

/**
 * Ties one HTML section to the shared stage position.
 *
 * `offset` is the section's distance from the camera's current waypoint in
 * section units: 0 when it owns the frame, -1 while it is still one section
 * ahead, +1 once the flight has moved on. Everything is driven off motion
 * values, so a scroll costs a compositor update rather than a React render.
 */
export function SectionStage({ id, children }: SectionStageProps) {
  const reduced = useReducedMotion();
  const offset = useMotionValue(0);
  const index = STAGE_SECTIONS.findIndex((section) => section.id === id);

  useEffect(() => {
    if (reduced || index < 0) return;
    return subscribeStageFrame((progress) => {
      const distance = progress - index;
      offset.set(Math.max(-1.5, Math.min(1.5, distance)));
    });
  }, [index, offset, reduced]);

  // Held flat across the middle so a section is fully legible for its whole
  // stay, then handed over during the traverse the camera is already flying.
  const opacity = useTransform(
    offset,
    [-1, -0.45, 0, 0.45, 1],
    [0.12, 1, 1, 1, 0.12]
  );
  const y = useTransform(offset, [-1, 0, 1], [70, 0, -70]);
  const scale = useTransform(offset, [-1, 0, 1], [0.975, 1, 0.975]);

  // The wrapper renders unconditionally even when the subscription above is
  // skipped: `useReducedMotion` reads false on the server, so branching on it
  // here would hand a reduced-motion client a different tree than it hydrates.
  // Left unsubscribed, `offset` stays 0 and these resolve to no transform.
  return (
    <motion.div style={{ opacity, y, scale }}>{children}</motion.div>
  );
}
