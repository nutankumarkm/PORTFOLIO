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
import { MorphBlob, MorphBlobLines } from "./MorphBlob";
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
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
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
      {/* Animated gradient mesh background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute top-1/4 -left-32 w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(212,255,58,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-[36vw] h-[36vw] rounded-full blur-[120px] opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(255,58,140,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[28vw] h-[28vw] rounded-full blur-[120px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(58,255,240,0.4) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)",
        }}
      />

      {/* Floating morphing blobs */}
      <MorphBlobLines
        className="absolute top-[8%] right-[10%] w-[280px] h-[280px] opacity-50 pointer-events-none"
        color="#d4ff3a"
        duration={22}
      />
      <MorphBlob
        className="absolute bottom-[12%] left-[6%] w-[200px] h-[200px] opacity-30 pointer-events-none"
        color="#ff3a8c"
        duration={16}
      />
      <MorphBlob
        className="absolute top-[20%] left-[40%] w-[120px] h-[120px] opacity-20 pointer-events-none"
        color="#3afff0"
        duration={18}
      />

      {/* Top status bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.6 }}
        className="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <span className="h-1 w-1 bg-lime rounded-full animate-pulse" />
          {profile.location}
        </span>
        <span className="hidden sm:inline">/</span>
        <span className="hidden sm:inline">{profile.availability}</span>
      </motion.div>

      {/* Center stage — kinetic name typography */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-4"
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
          <span className="block text-[clamp(2.8rem,12vw,9.5rem)]">
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
          <span className="block text-[clamp(2.8rem,12vw,9.5rem)] gradient-text">
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

        {/* Role morph text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.6 }}
          className="mt-6 flex items-center gap-3 font-mono-display text-sm sm:text-base tracking-[0.3em] uppercase"
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
          className="mt-8 max-w-[min(92vw,640px)] text-center text-base sm:text-lg text-muted-foreground leading-relaxed"
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
            className="group relative inline-flex items-center gap-3 rounded-full bg-lime px-6 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-ink-900 overflow-hidden"
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
            className="inline-flex items-center gap-2 rounded-full border border-ink-500 px-6 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-foreground hover:border-lime/60 hover:text-lime transition-colors"
          >
            Say Hello
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Bottom metrics strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 0.8 }}
        className="absolute bottom-8 left-0 right-0 z-10 px-4"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-600/40 border border-ink-600/40 rounded-2xl overflow-hidden backdrop-blur-sm">
          {heroMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4 + i * 0.1 }}
              className="bg-ink-900/80 px-4 py-4 sm:py-5 flex flex-col"
            >
              <div
                className="font-display text-2xl sm:text-3xl font-bold"
                style={{ color: accentMap[m.accent] }}
              >
                {m.value}
              </div>
              <div className="mt-1 font-mono-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.6, duration: 0.6 }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
