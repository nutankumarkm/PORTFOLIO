"use client";

import { useSyncExternalStore } from "react";

/**
 * One scroll driver for the whole landing page.
 *
 * The WebGL backdrop and the HTML sections both read their motion from the same
 * fractional position, so the camera flight and the section transitions are one
 * animation sampled twice: `2.35` means "35% of the way from Skills to Job Fit"
 * to every consumer. Nothing here owns a timeline of its own, which is why the
 * background can never drift out of step with the page.
 *
 * Positions are measured with `offsetTop`/`offsetHeight` rather than
 * `getBoundingClientRect()` on purpose — the sections carry a scroll-driven
 * transform, and reading their transformed rect would feed that transform back
 * into the value that produced it.
 */

export interface StageSection {
  id: string;
  label: string;
}

/** DOM order of the landing page. Index === waypoint index in the 3D scene. */
export const STAGE_SECTIONS: StageSection[] = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "jobmatcher", label: "Job Fit" },
  { id: "experience", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Honors" },
  { id: "contact", label: "Contact" },
];

export const STAGE_LAST = STAGE_SECTIONS.length - 1;

/* --- Internal state ------------------------------------------------------- */

let elements: (HTMLElement | null)[] = [];
let anchors: number[] = [];
let progress = 0;
let index = 0;

let dirty = true;
let rafId = 0;
let refCount = 0;
let observer: ResizeObserver | null = null;
let detach: (() => void) | null = null;

const frameListeners = new Set<(progress: number) => void>();
const indexListeners = new Set<() => void>();

/** Document-space Y, immune to any transform on the element or its ancestors. */
function documentTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/** Vertical center of every section, in document space. */
function measure() {
  const fallbackGap = window.innerHeight || 800;
  let previous = 0;

  anchors = STAGE_SECTIONS.map((section, i) => {
    let el = elements[i];
    if (!el || !el.isConnected) {
      el = document.getElementById(section.id);
      elements[i] = el;
      if (el && observer) observer.observe(el);
    }

    // A section missing from the current page still needs a slot, and the list
    // has to stay strictly increasing for the bracket search below.
    let anchor = el
      ? documentTop(el) + el.offsetHeight / 2
      : i === 0
        ? 0
        : previous + fallbackGap;
    if (i > 0 && anchor <= previous) anchor = previous + 1;

    previous = anchor;
    return anchor;
  });

  dirty = false;
}

/** Fractional section index of the viewport center, clamped to the page. */
function computeProgress(): number {
  if (dirty || anchors.length === 0) measure();

  const center = window.scrollY + window.innerHeight / 2;
  if (center <= anchors[0]) return 0;
  if (center >= anchors[STAGE_LAST]) return STAGE_LAST;

  for (let i = 0; i < STAGE_LAST; i++) {
    const next = anchors[i + 1];
    if (center < next) {
      const start = anchors[i];
      return i + (center - start) / (next - start);
    }
  }
  return STAGE_LAST;
}

function flush() {
  rafId = 0;

  const nextProgress = computeProgress();
  if (Math.abs(nextProgress - progress) > 1e-4) {
    progress = nextProgress;
    frameListeners.forEach((listener) => listener(progress));
  }

  const nextIndex = Math.min(STAGE_LAST, Math.max(0, Math.round(progress)));
  if (nextIndex !== index) {
    index = nextIndex;
    indexListeners.forEach((listener) => listener());
  }
}

function schedule() {
  if (rafId) return;
  rafId = requestAnimationFrame(flush);
}

function invalidate() {
  dirty = true;
  schedule();
}

function retain() {
  refCount += 1;
  if (refCount > 1) return;

  elements = [];
  dirty = true;

  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(invalidate);
    observer.observe(document.body);
  }

  // measure() picks up the section nodes and hands them to the observer, so a
  // tab switch or an expanding panel re-anchors the whole stage.
  measure();

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", invalidate, { passive: true });
  if (document.fonts) {
    document.fonts.ready.then(invalidate).catch(() => {});
  }

  detach = () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", invalidate);
    observer?.disconnect();
    observer = null;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    elements = [];
  };

  flush();
}

function release() {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) return;
  detach?.();
  detach = null;
}

/* --- Public API ----------------------------------------------------------- */

/**
 * Per-frame fractional position, delivered outside React so consumers can drive
 * motion values or a WebGL camera without a render per scroll tick. Fires once
 * on subscribe with the current value.
 */
export function subscribeStageFrame(
  listener: (progress: number) => void
): () => void {
  retain();
  frameListeners.add(listener);
  listener(progress);

  return () => {
    frameListeners.delete(listener);
    release();
  };
}

function subscribeIndex(listener: () => void): () => void {
  retain();
  indexListeners.add(listener);

  return () => {
    indexListeners.delete(listener);
    release();
  };
}

export const getStageProgress = () => progress;
export const getStageIndex = () => index;

/** Nearest section, re-rendering only when the active one actually flips. */
export function useStageIndex(): number {
  return useSyncExternalStore(subscribeIndex, getStageIndex, () => 0);
}

/**
 * Scrolls so the target section lands exactly on its stage anchor.
 *
 * `scrollIntoView()` reads the transformed rect, so a section that is mid-fade
 * would be chased to the wrong offset and settle off-center once its transform
 * relaxed. Anchors are transform-free, so this lands on a whole-number stage
 * position every time.
 */
export function scrollToStageSection(target: number | string) {
  const i =
    typeof target === "number"
      ? target
      : STAGE_SECTIONS.findIndex((s) => s.id === target);

  if (i < 0 || i > STAGE_LAST) {
    if (typeof target === "string") {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  if (dirty || anchors.length === 0) measure();
  if (!elements[i]) {
    // Not on this page — let the browser resolve it however it can.
    document
      .getElementById(STAGE_SECTIONS[i].id)
      ?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  window.scrollTo({
    top: Math.max(0, anchors[i] - window.innerHeight / 2),
    behavior: "smooth",
  });
}
