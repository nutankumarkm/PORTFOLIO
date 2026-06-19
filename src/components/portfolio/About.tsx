"use client";

import { motion } from "framer-motion";
import { aboutParagraphs, profile, education } from "@/lib/portfolio-data";
import { MorphSilhouette } from "./MorphSilhouette";
import { SectionHeading } from "./SectionHeading";
import { Magnetic } from "./Magnetic";

export function About() {
  return (
    <section
      id="about"
      className="relative lg:min-h-screen lg:flex lg:flex-col lg:justify-center py-20 lg:py-0 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background watermark */}
      <div
        className="absolute top-10 right-0 font-display text-[20vw] font-bold text-foreground/[0.02] leading-none pointer-events-none select-none"
        aria-hidden
      >
        ABOUT
      </div>

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading index="02" eyebrow="Who" title="About" accent="lime" />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-start">
          {/* Left: morphing portrait + meta */}
          <div className="lg:sticky lg:top-32">
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-2xl border border-ink-600 bg-gradient-to-b from-ink-800 to-ink-900 overflow-hidden">
                {/* Inner frame */}
                <div className="absolute inset-0 grain z-10" />
                <MorphSilhouette
                  className="absolute inset-0 w-full h-full p-8"
                  color="#d4ff3a"
                />

                {/* Corner ticks */}
                {[
                  "top-3 left-3 border-t border-l",
                  "top-3 right-3 border-t border-r",
                  "bottom-3 left-3 border-b border-l",
                  "bottom-3 right-3 border-b border-r",
                ].map((pos) => (
                  <span
                    key={pos}
                    className={`absolute ${pos} h-4 w-4 border-lime/60`}
                  />
                ))}

                {/* Bottom identity strip */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <div className="rounded-xl border border-ink-600/80 bg-ink-900/70 backdrop-blur-md p-3 flex items-center justify-between">
                    <div>
                      <div className="font-display text-sm font-semibold text-foreground">
                        {profile.name}
                      </div>
                      <div className="font-mono-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {profile.role}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
                        <span className="font-mono-display text-[10px] uppercase tracking-[0.15em] text-lime">
                          Online
                        </span>
                      </div>
                      <span className="font-mono-display text-[10px] text-muted-foreground">
                        {profile.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating tag */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="absolute -top-4 -right-4 rounded-full border border-magenta/40 bg-ink-900 px-3 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.2em] text-magenta glow-magenta"
              >
                v2026.1
              </motion.div>
            </div>
          </div>

          {/* Right: paragraphs */}
          <div className="space-y-6">
            {aboutParagraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className={`text-base sm:text-lg leading-relaxed ${
                  i === 0
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {p}
              </motion.p>
            ))}

            {/* Education card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-10 rounded-2xl border border-ink-600 bg-ink-800/50 p-6"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-lime mb-2">
                    Education
                  </div>
                  <div className="font-display text-lg font-semibold text-foreground">
                    {education.degree}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {education.school}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    {education.period}
                  </div>
                  <div className="font-display text-2xl font-bold text-lime">
                    {education.cgpa}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Resume Download Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 flex"
            >
              <Magnetic
                as="a"
                href="/resume.pdf"
                download="KM_Nutankumar_Resume.pdf"
                strength={0.25}
                dataCursor="hover"
                className="group relative inline-flex items-center gap-3 rounded-full bg-lime px-6 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-background overflow-hidden"
              >
                <span className="relative z-10">Download Resume</span>
                <span className="relative z-10 transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
                <span className="absolute inset-0 bg-cyan-acc -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
