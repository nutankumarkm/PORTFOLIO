"use client";

import { motion } from "framer-motion";
import { aboutParagraphs, education } from "@/lib/portfolio-data";
import { TerminalPhoto } from "./TerminalPhoto";
import { SectionHeading } from "./SectionHeading";
import { Magnetic } from "./Magnetic";

export function About() {
  return (
    <section
      id="about"
      className="pointer-events-none relative overflow-hidden px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-0"
    >
      {/* Background watermark */}
      <div
        className="pointer-events-none absolute right-0 top-10 select-none font-display text-[20vw] font-bold leading-none text-base-content/[0.02]"
        aria-hidden
      >
        ABOUT
      </div>

      <div className="pointer-events-auto relative mx-auto max-w-6xl">
        <SectionHeading index="02" eyebrow="Who" title="About" accent="lime" />

        <div className="mt-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Left: portrait */}
          <div className="lg:sticky lg:top-32">
            <div className="relative">
              {/* The terminal draws its own chrome — the wrapper only sets the
                  footprint and drops a grain pass over the whole window. */}
              <div className="relative aspect-[4/5] shadow-xl">
                <TerminalPhoto
                  className="absolute inset-0 h-full w-full"
                  color="var(--color-primary)"
                />
                <div className="grain pointer-events-none absolute inset-0 z-10 rounded-box" />
              </div>

              {/* Floating version tag */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.2 }}
                className="badge badge-secondary badge-soft absolute -right-4 -top-4 font-mono-display text-[10px] uppercase tracking-[0.2em] shadow-lg"
              >
                v2026.1
              </motion.div>
            </div>
          </div>

          {/* Right: narrative. The 3D workspace sits directly behind this
              column, so the prose needs its own surface to stay legible —
              every other section already reads off a card. */}
          <div className="space-y-6">
            {/* Opaque enough to carry the text on its own: the wrapper's
                scroll transform makes this a backdrop root, so the blur can't
                be relied on to sample the canvas behind it. */}
            <div className="space-y-6 rounded-box border border-base-300/70 bg-base-100/90 p-6 shadow-lg backdrop-blur-xl sm:p-8">
              {aboutParagraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ delay: i * 0.15, duration: 0.7 }}
                  className={`text-base leading-relaxed sm:text-lg ${
                    i === 0 ? "font-medium text-base-content" : "text-base-content/80"
                  }`}
                >
                  {p}
                </motion.p>
              ))}
            </div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="card glow-card mt-10 border border-base-300 bg-base-200/85 backdrop-blur-md"
            >
              <div className="card-body flex-row flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                    Education
                  </div>
                  <h3 className="card-title font-display text-lg">{education.degree}</h3>
                  <p className="mt-1 text-sm text-base-content/70">{education.school}</p>
                </div>
                <div className="text-right">
                  <div className="mb-1 font-mono-display text-[10px] uppercase tracking-[0.2em] text-base-content/60">
                    {education.period}
                  </div>
                  <div className="font-display text-2xl font-bold text-primary">
                    {education.cgpa}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Resume */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 flex"
            >
              <Magnetic
                as="a"
                href="/resume.pdf"
                download="KM_Nutankumar_Resume.pdf"
                strength={0.25}
                dataCursor="hover"
                className="btn btn-primary group gap-3 rounded-full px-6 font-mono-display text-xs uppercase tracking-[0.2em] shadow-lg"
              >
                Download Resume
                <span className="transition-transform group-hover:translate-y-0.5">↓</span>
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
