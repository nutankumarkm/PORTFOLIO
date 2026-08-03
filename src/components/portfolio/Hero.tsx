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
import { scrollToStageSection } from "@/lib/scroll-stage";
import { accent } from "@/lib/accent";
import { MorphBlob } from "./MorphBlob";
import { Magnetic } from "./Magnetic";
import { ScrambleText } from "./ScrambleText";

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
      className="hero grain relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* Soft gradient halo, parallaxed against the pointer */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--color-primary) 50%, transparent) 0%, transparent 65%)",
          }}
        />
      </motion.div>

      <MorphBlob
        className="pointer-events-none absolute right-[-8%] top-1/2 aspect-square w-[min(45vw,520px)] -translate-y-1/2 opacity-[0.22]"
        color="var(--color-primary)"
        duration={18}
      />

      {/* Faint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-base-content) 1px, transparent 1px), linear-gradient(90deg, var(--color-base-content) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
        }}
      />

      {/* Left meta strip */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.0, duration: 0.6 }}
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 sm:left-6 lg:flex"
      >
        <span className="rotate-180 font-mono-display text-[10px] uppercase tracking-[0.3em] text-base-content/60 [writing-mode:vertical-rl]">
          {profile.location}
        </span>
        <span className="h-12 w-px bg-base-300" />
        <span className="rotate-180 font-mono-display text-[10px] uppercase tracking-[0.3em] text-primary [writing-mode:vertical-rl]">
          {profile.availability}
        </span>
      </motion.div>

      {/* Right scroll indicator */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 sm:right-6 lg:flex"
      >
        <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-base-content/60 [writing-mode:vertical-rl]">
          Scroll
        </span>
        <div className="relative h-16 w-px overflow-hidden bg-base-300">
          <motion.span
            className="absolute left-0 top-0 w-full bg-primary"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "50%" }}
          />
        </div>
      </motion.div>

      {/* Center stage */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="hero-content relative z-10 min-h-[100svh] flex-col px-4 pb-32 pt-24 text-center"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="mb-6 flex items-center gap-3 font-mono-display text-[11px] uppercase tracking-[0.4em] text-base-content/60"
        >
          <span className="h-px w-8 bg-primary/60" />
          <ScrambleText text="Portfolio — 2026" trigger="mount" speed={1.5} />
          <span className="h-px w-8 bg-primary/60" />
        </motion.div>

        {/* Kinetic name */}
        <h1 className="group relative flex select-none flex-col items-center justify-center gap-y-1 text-center font-display text-[clamp(2.2rem,8vw,3.6rem)] font-bold leading-none tracking-tight md:flex-row md:gap-x-4 md:text-[clamp(3.5rem,5.5vw,5.2rem)]">
          <div className="absolute -left-6 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-gradient-to-t from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" />
          <div className="absolute -right-6 top-1/2 hidden h-8 w-px -translate-y-1/2 bg-gradient-to-t from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" />

          <span className="block">
            {firstName.map((ch, i) => (
              <motion.span
                key={`f-${i}`}
                initial={{ y: "110%", opacity: 0, rotateX: -90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{
                  delay: 2 + i * 0.04,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.12,
                  color: "var(--color-primary)",
                  transition: { type: "spring", stiffness: 400, damping: 12 },
                }}
                className="inline-block origin-bottom cursor-default"
              >
                {ch}
              </motion.span>
            ))}
          </span>

          <span className="gradient-text block">
            {lastName.map((ch, i) => (
              <motion.span
                key={`l-${i}`}
                initial={{ y: "110%", opacity: 0, rotateX: -90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{
                  delay: 2.15 + i * 0.04,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.12,
                  filter: "drop-shadow(0 0 10px var(--color-primary))",
                  transition: { type: "spring", stiffness: 400, damping: 12 },
                }}
                className="inline-block origin-bottom cursor-default"
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Role row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.6 }}
          className="mt-6 flex items-center gap-3 font-mono-display text-xs uppercase tracking-[0.25em] sm:text-sm"
        >
          <span className="text-base-content/60">{profile.role}</span>
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="inline-block text-primary"
          >
            ✦
          </motion.span>
          <span className="text-primary">{profile.roleAlt}</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.7 }}
          className="mt-8 min-h-[3.5rem] max-w-[min(92vw,580px)] text-base leading-relaxed text-base-content/70 sm:text-lg"
        >
          {profile.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1, duration: 0.6 }}
          className="mt-6 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Magnetic
            as="button"
            strength={0.3}
            dataCursor="hover"
            dataCursorLabel="View"
            onClick={() => scrollToStageSection("projects")}
            className="btn btn-primary group gap-3 rounded-full px-6 font-mono-display text-xs uppercase tracking-[0.2em]"
          >
            View Work
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Magnetic>
          <Magnetic
            as="a"
            href={`mailto:${profile.email}`}
            strength={0.3}
            dataCursor="hover"
            className="btn btn-outline gap-2 rounded-full px-6 font-mono-display text-xs uppercase tracking-[0.2em]"
          >
            Say Hello
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Metrics strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 w-[min(94vw,720px)] -translate-x-1/2"
      >
        <div className="stats w-full rounded-full border border-base-300 bg-base-100/60 backdrop-blur-md">
          {heroMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4 + i * 0.1 }}
              className="stat place-items-center gap-0 px-2 py-3 sm:px-4"
            >
              <div
                className={`stat-value font-display text-base font-bold leading-none sm:text-xl ${accent(m.accent).text}`}
              >
                {m.value}
              </div>
              <div className="stat-title mt-1 text-center font-mono-display text-[7px] uppercase leading-normal tracking-[0.1em] sm:text-[9px] sm:tracking-[0.15em]">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
