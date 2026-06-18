"use client";

import { motion } from "framer-motion";
import { profile } from "@/lib/portfolio-data";
import { Magnetic } from "./Magnetic";
import { MorphBlobLines } from "./MorphBlob";
import { ScrambleText } from "./ScrambleText";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background morph blobs */}
      <MorphBlobLines
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,800px)] aspect-square opacity-30 pointer-events-none"
        color="#d4ff3a"
        duration={24}
      />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,255,58,0.08), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <span className="h-px w-10 bg-lime/60" />
          <span className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-lime">
            <ScrambleText text="Get in touch" trigger="view" />
          </span>
          <span className="h-px w-10 bg-lime/60" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[0.95]"
        >
          Let&apos;s build
          <br />
          <span className="gradient-text">something rare.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground"
        >
          I&apos;m open to AI engineering roles, contract builds, and research collaborations. Drop a line and I&apos;ll respond within a day.
        </motion.p>

        {/* Primary CTA — magnetic, morphing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <Magnetic
            as="a"
            href={`mailto:${profile.email}`}
            strength={0.4}
            dataCursor="view"
            dataCursorLabel="Email"
            className="group relative inline-flex items-center gap-4 rounded-full bg-lime px-8 sm:px-12 py-5 sm:py-6 font-display text-base sm:text-lg font-bold text-background overflow-hidden"
          >
            <span className="relative z-10">{profile.email}</span>
            <motion.span
              className="relative z-10"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
            <span className="absolute inset-0 bg-cyan-acc -translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </Magnetic>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm"
        >
          <Magnetic
            as="a"
            href={profile.linkedin}
            strength={0.3}
            dataCursor="hover"
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-magenta group-hover:scale-150 transition-transform" />
            <span className="font-mono-display text-[11px] uppercase tracking-[0.2em]">
              LinkedIn
            </span>
          </Magnetic>
          <Magnetic
            as="a"
            href={`tel:${profile.phone}`}
            strength={0.3}
            dataCursor="hover"
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-acc group-hover:scale-150 transition-transform" />
            <span className="font-mono-display text-[11px] uppercase tracking-[0.2em]">
              {profile.phone}
            </span>
          </Magnetic>
          <Magnetic
            as="a"
            href={`mailto:${profile.email}`}
            strength={0.3}
            dataCursor="hover"
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lime group-hover:scale-150 transition-transform" />
            <span className="font-mono-display text-[11px] uppercase tracking-[0.2em]">
              Email
            </span>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
