"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { imageToAscii, type AsciiRun } from "@/lib/ascii";
import { profile } from "@/lib/portfolio-data";
import { DARK_THEMES, type Theme } from "./ThemeProvider";

interface TerminalPhotoProps {
  className?: string;
  color?: string;
}

const PHOTO_SRC = "/profile-photo.jpg";

/** A single syntax-coloured run of characters inside a terminal line. */
type Token = { text: string; className?: string };

const DIM = "text-base-content/40";
const KEY = "text-accent";
const STR = "text-primary";
const KEYWORD = "text-secondary";

/* The file "printed" under the portrait. Written as tokens rather than a string
   so the typewriter can reveal it character by character without losing colour. */
const CODE_LINES: Token[][] = [
  [
    { text: "$ ", className: "text-primary" },
    { text: "cat ", className: "text-base-content/70" },
    { text: "profile.ts", className: "text-base-content/90" },
  ],
  [
    { text: "const ", className: KEYWORD },
    { text: "profile", className: "text-base-content/90" },
    { text: " = {", className: DIM },
  ],
  [
    { text: "  name", className: KEY },
    { text: ": ", className: DIM },
    { text: `"${profile.name}"`, className: STR },
    { text: ",", className: DIM },
  ],
  [
    { text: "  role", className: KEY },
    { text: ": ", className: DIM },
    { text: `"${profile.role}"`, className: STR },
    { text: ",", className: DIM },
  ],
  [
    { text: "  base", className: KEY },
    { text: ": ", className: DIM },
    { text: `"${profile.location}"`, className: STR },
    { text: ",", className: DIM },
  ],
  [{ text: "};", className: DIM }],
];

/* Character offsets, precomputed once so the render pass stays pure: where each
   line starts in the stream, and where each token starts within its line. */
const LINE_LENGTHS = CODE_LINES.map((line) =>
  line.reduce((n, t) => n + t.text.length, 0)
);
const LINE_STARTS = LINE_LENGTHS.map((_, i) =>
  LINE_LENGTHS.slice(0, i).reduce((a, b) => a + b, 0)
);
const TOKEN_STARTS = CODE_LINES.map((line) =>
  line.map((_, j) => line.slice(0, j).reduce((n, t) => n + t.text.length, 0))
);
const TOTAL_CHARS = LINE_LENGTHS.reduce((a, b) => a + b, 0);

const TYPE_MS = 16;

/* Darkest pixels print at full strength, highlights fade out — the glyph
   density carries the form, the opacity carries the tone. */
const LEVEL_CLASS = [
  "text-primary",
  "text-primary/80",
  "text-primary/55",
  "text-primary/25",
];

export function TerminalPhoto({
  className = "",
  color = "var(--color-primary)",
}: TerminalPhotoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  // On dark themes the glyphs are the light in the frame, so ink follows
  // brightness rather than darkness.
  const { resolvedTheme } = useTheme();
  const isDark = DARK_THEMES.includes(resolvedTheme as Theme);

  const ascii = useAsciiArt(PHOTO_SRC, paneRef, isDark);

  // Hovering (or pinning) the portrait swaps the glyphs back for the photo.
  const [hoverPane, setHoverPane] = useState(false);
  const [pinnedRaw, setPinnedRaw] = useState(false);
  const showRaw = !ascii || pinnedRaw || hoverPane;

  // Number of characters of the code block revealed so far. With reduced motion
  // the file is simply printed in full.
  const [typedChars, setTypedChars] = useState(0);
  const typed = reduceMotion ? TOTAL_CHARS : typedChars;

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const id = setInterval(() => {
      setTypedChars((n) => {
        if (n >= TOTAL_CHARS) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [inView, reduceMotion]);

  const done = typed >= TOTAL_CHARS;

  // Mouse position inside the card (normalized between -0.5 and 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Dynamic rotate values based on mouse position
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 150,
    damping: 20,
  });

  // Dynamic reflection position for glass glare effect
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const cols = ascii?.runs[0]?.reduce((n, r) => n + r.text.length, 0) ?? 0;
  const rows = ascii?.runs.length ?? 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 relative h-full w-full select-none ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: `0 24px 60px -30px ${color}`,
        }}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-box border border-base-300 bg-base-200/70 font-mono-display shadow-2xl backdrop-blur-md transition-colors duration-300 hover:border-primary/40"
      >
        {/* ── Title bar ─────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2 border-b border-base-300 bg-base-300/40 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-error/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          <span className="ml-1.5 truncate text-[10px] tracking-tight text-base-content/55">
            nutan@portfolio:~/about
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-[9px] uppercase tracking-[0.18em] text-primary">
              online
            </span>
          </span>
        </div>

        {/* ── Portrait, rendered as glyphs ──────────────────────────── */}
        <div
          ref={paneRef}
          onMouseEnter={() => setHoverPane(true)}
          onMouseLeave={() => setHoverPane(false)}
          className="relative min-h-0 flex-1 overflow-hidden bg-base-100/80"
        >
          {/* Source photo — always mounted (it carries the alt text) and faded
              in on hover, or while the glyph grid is still being built. */}
          <img
            src={PHOTO_SRC}
            alt={profile.name}
            className={`absolute inset-0 h-full w-full object-cover object-[center_28%] transition-opacity duration-500 ${
              showRaw ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
          />

          {ascii && (
            <motion.pre
              aria-hidden
              initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
              animate={inView ? { clipPath: "inset(0 0 0% 0)" } : undefined}
              transition={{ duration: 1.1, ease: "linear" }}
              style={{
                fontSize: `${ascii.fontSize}px`,
                lineHeight: `${ascii.lineHeight}px`,
              }}
              className={`absolute inset-0 overflow-hidden whitespace-pre font-mono-display transition-opacity duration-500 [font-variant-ligatures:none] ${
                showRaw ? "opacity-0" : "opacity-100"
              }`}
            >
              {ascii.runs.map((line, y) => (
                <div key={y}>
                  {line.map((run, i) => (
                    <span key={i} className={LEVEL_CLASS[run.level]}>
                      {run.text}
                    </span>
                  ))}
                </div>
              ))}
            </motion.pre>
          )}

          {/* CRT scanlines */}
          <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />

          {/* Corner brackets — the "selection" marks of an image viewer */}
          {[
            "left-2 top-2 border-l border-t",
            "right-2 top-2 border-r border-t",
            "bottom-2 left-2 border-b border-l",
            "bottom-2 right-2 border-b border-r",
          ].map((pos) => (
            <span
              key={pos}
              className={`pointer-events-none absolute ${pos} h-3.5 w-3.5 border-primary/50`}
            />
          ))}

          {/* File label, top-left */}
          <span className="pointer-events-none absolute left-4 top-4 rounded-sm border border-base-300/70 bg-base-100/70 px-1.5 py-0.5 text-[9px] tracking-tight text-base-content/70 backdrop-blur-sm">
            profile.jpg
          </span>

          {/* Render-mode toggle, bottom-left */}
          <button
            type="button"
            onClick={() => setPinnedRaw((v) => !v)}
            aria-pressed={pinnedRaw}
            data-cursor="hover"
            className="absolute bottom-3 left-4 rounded-sm border border-base-300/70 bg-base-100/70 px-1.5 py-0.5 text-[9px] tracking-tight text-base-content/70 backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
          >
            {pinnedRaw ? "--raw" : "--ascii"}
          </button>

          {/* Read-out, bottom-right */}
          <span className="pointer-events-none absolute bottom-3 right-4 text-[9px] tracking-tight text-base-content/55 [text-shadow:0_1px_2px_var(--color-base-100)]">
            {showRaw ? "1024×1280 · rgb" : `${cols}×${rows} · ascii`}
          </span>

          {/* Fade into the code block below */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-base-100/70 to-transparent" />
        </div>

        {/* ── Code block ────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-base-300 bg-base-100/60 px-3 py-2.5 text-[10px] leading-[1.55] backdrop-blur-sm">
          {CODE_LINES.map((line, i) => {
            const lineStart = LINE_STARTS[i];
            const lineLength = LINE_LENGTHS[i];

            // Lines beyond the caret are not printed yet.
            if (typed <= lineStart && i > 0) return null;

            const budgetInLine = typed - lineStart;
            const isCaretLine = typed < lineStart + lineLength;

            return (
              <div key={i} className="flex gap-2 whitespace-pre">
                <span className="w-4 shrink-0 select-none text-right text-base-content/25">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  {line.map((token, j) => {
                    const visible = Math.max(
                      0,
                      Math.min(token.text.length, budgetInLine - TOKEN_STARTS[i][j])
                    );
                    if (visible === 0) return null;
                    return (
                      <span key={j} className={token.className}>
                        {token.text.slice(0, visible)}
                      </span>
                    );
                  })}
                  {isCaretLine && <Caret />}
                </span>
              </div>
            );
          })}

          {/* Prompt line, revealed once the file has finished printing */}
          <div className={`flex gap-2 whitespace-pre ${done ? "" : "invisible"}`}>
            <span className="w-4 shrink-0 select-none text-right text-base-content/25">
              {CODE_LINES.length + 1}
            </span>
            <span className="text-primary">
              ${" "}
              <Caret />
            </span>
          </div>
        </div>

        {/* Dynamic glare reflection following the cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--glare-x)_var(--glare-y),rgba(255,255,255,0.16)_0%,transparent_55%)] opacity-0 mix-blend-overlay transition-opacity duration-300 hover:opacity-100"
          style={
            {
              "--glare-x": glareX,
              "--glare-y": glareY,
            } as React.CSSProperties
          }
        />
      </motion.div>
    </div>
  );
}

/** Blinking block cursor. */
function Caret() {
  return (
    <span
      className="ml-px inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-primary"
      style={{ animation: "blink 1s step-end infinite" }}
    />
  );
}

interface AsciiArt {
  runs: AsciiRun[][];
  fontSize: number;
  lineHeight: number;
}

/**
 * Builds the glyph grid for `src` sized to fill `paneRef`, and rebuilds it when
 * the pane resizes. Column count follows the pane width so the art stays around
 * a 4.5px cell — dense enough to read as a face, coarse enough to read as text.
 */
function useAsciiArt(
  src: string,
  paneRef: React.RefObject<HTMLDivElement | null>,
  invert: boolean
) {
  const [art, setArt] = useState<AsciiArt | null>(null);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    let cancelled = false;
    let frame = 0;

    const img = new Image();
    img.decoding = "async";
    img.src = src;

    /** Advance width of one character, in px per px of font-size. */
    const charRatio = () => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;visibility:hidden;white-space:pre;font-size:100px;";
      probe.textContent = "0".repeat(20);
      pane.appendChild(probe);
      const ratio = probe.getBoundingClientRect().width / 20 / 100;
      probe.remove();
      return ratio || 0.6;
    };

    const build = () => {
      const { width, height } = pane.getBoundingClientRect();
      if (!width || !height) return;

      const cols = Math.max(40, Math.min(110, Math.round(width / 4.5)));
      const fontSize = width / cols / charRatio();
      const rows = Math.max(20, Math.round(height / fontSize));

      const runs = imageToAscii(img, cols, rows, {
        aspect: width / height,
        focusY: 0.26,
        contrast: 1.25,
        inkGamma: 0.7,
        invert,
        // The source is a scanned print with a pale ~30px border.
        trim: 0.045,
      });
      if (runs && !cancelled) {
        setArt({ runs, fontSize, lineHeight: height / rows });
      }
    };

    const scheduleBuild = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    };

    // Wait for both the bitmap and the mono font — measuring a fallback font
    // would size every glyph wrong.
    Promise.all([
      img.decode().catch(() => undefined),
      document.fonts?.ready ?? Promise.resolve(),
    ]).then(() => {
      if (!cancelled) scheduleBuild();
    });

    const observer = new ResizeObserver(() => {
      if (img.complete) scheduleBuild();
    });
    observer.observe(pane);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [src, paneRef, invert]);

  return art;
}
