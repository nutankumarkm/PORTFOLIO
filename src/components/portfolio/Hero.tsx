"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { profile, heroMetrics } from "@/lib/portfolio-data";
import { MorphBlob } from "./MorphBlob";
import { Magnetic } from "./Magnetic";
import { ScrambleText } from "./ScrambleText";

const accentMap: Record<string, string> = {
  lime: "var(--lime)",
  cyan: "var(--cyan)",
  magenta: "var(--magenta)",
  amber: "var(--amber)",
};

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 20,
  });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 20,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mx.set((e.clientX - w / 2) / w);
      my.set((e.clientY - h / 2) / h);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const firstName = profile.firstName.split("");
  const lastName = profile.lastName.split("");

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-[100svh] w-full overflow-hidden grain"
    >
      {/* Single soft gradient halo — replaces the busy triple-mesh */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--lime) 50%, transparent) 0%, transparent 65%)",
          }}
        />
      </motion.div>

      {/* Single morphing blob — focal accent on the right */}
      <MorphBlob
        className="absolute top-1/2 right-[-8%] -translate-y-1/2 w-[min(45vw,520px)] aspect-square opacity-[0.22] pointer-events-none"
        color="var(--lime)"
        duration={18}
      />

      {/* Subtle grid — much fainter than before */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
        }}
      />

      {/* Left-side vertical meta strip (replaces the old overlapping top bar) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.0, duration: 0.6 }}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-20"
      >
        <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          {profile.location}
        </span>
        <span className="h-12 w-px bg-hairline" />
        <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-lime [writing-mode:vertical-rl] rotate-180">
          {profile.availability}
        </span>
      </motion.div>

      {/* Right-side vertical scroll indicator (replaces bottom cue) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 z-20"
      >
        <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl]">
          Scroll
        </span>
        <div className="h-16 w-px bg-hairline relative overflow-hidden">
          <motion.span
            className="absolute top-0 left-0 w-full bg-lime"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "50%" }}
          />
        </div>
      </motion.div>

      {/* Center stage — kinetic name typography */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-4 pt-24 pb-32"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="mb-6 flex items-center gap-3 font-mono-display text-[11px] uppercase tracking-[0.4em] text-muted-foreground"
        >
          <span className="h-px w-8 bg-lime/60" />
          <ScrambleText text="Portfolio — 2026" trigger="mount" speed={1.5} />
          <span className="h-px w-8 bg-lime/60" />
        </motion.div>

        {/* Name — kinetic reveal */}
        <h1 className="font-display font-bold text-center leading-[0.85] tracking-tight">
          <span className="block text-[clamp(2.6rem,11vw,8.5rem)]">
            {firstName.map((ch, i) => (
              <motion.span
                key={`f-${i}`}
                initial={{ y: "110%", opacity: 0, rotateX: -90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{
                  delay: 2 + i * 0.05,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
                style={{ transformOrigin: "bottom" }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
          <span className="block text-[clamp(2.6rem,11vw,8.5rem)] gradient-text">
            {lastName.map((ch, i) => (
              <motion.span
                key={`l-${i}`}
                initial={{ y: "110%", opacity: 0, rotateX: -90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{
                  delay: 2.15 + i * 0.05,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
                style={{ transformOrigin: "bottom" }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Role + location row — replaces cluttered status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.6 }}
          className="mt-6 flex items-center gap-3 font-mono-display text-xs sm:text-sm tracking-[0.25em] uppercase"
        >
          <span className="text-muted-foreground">{profile.role}</span>
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="inline-block text-lime"
          >
            ✦
          </motion.span>
          <span className="text-lime">{profile.roleAlt}</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.7 }}
          className="mt-8 max-w-[min(92vw,580px)] text-center text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          {profile.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 items-center"
        >
          <Magnetic
            as="button"
            strength={0.3}
            dataCursor="hover"
            dataCursorLabel="View"
            onClick={() =>
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group relative inline-flex items-center gap-3 rounded-full bg-lime px-6 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-background overflow-hidden"
          >
            <span className="relative z-10">View Work</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">
              →
            </span>
            <span className="absolute inset-0 bg-cyan-acc -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Magnetic>
          <Magnetic
            as="a"
            href={`mailto:${profile.email}`}
            strength={0.3}
            dataCursor="hover"
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-foreground hover:border-lime/60 hover:text-lime transition-colors"
          >
            Say Hello
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Bottom metrics strip — slim, single row, no longer overlaps scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[min(94vw,720px)]"
      >
        <div className="flex items-center justify-between gap-4 rounded-full border border-hairline bg-surface-2/60 backdrop-blur-md px-5 py-3">
          {heroMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4 + i * 0.1 }}
              className="flex flex-col items-center text-center flex-1"
            >
              <div
                className="font-display text-base sm:text-xl font-bold leading-none"
                style={{ color: accentMap[m.accent] }}
              >
                {m.value}
              </div>
              <div className="mt-1 font-mono-display text-[9px] uppercase tracking-[0.15em] text-muted-foreground hidden sm:block">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
