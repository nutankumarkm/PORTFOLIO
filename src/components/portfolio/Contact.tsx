"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/lib/portfolio-data";
import { Magnetic } from "./Magnetic";
import { MorphBlobLines } from "./MorphBlob";
import { ScrambleText } from "./ScrambleText";

type ProjectType = "rag" | "agent" | "flutter" | "tuning" | "consulting" | "";
type Scale = "mvp" | "production" | "enterprise" | "";
type Goal = "speed" | "latency" | "robustness" | "";

const projectTypes = [
  { id: "rag", label: "RAG Pipeline", desc: "120ms search indexing" },
  { id: "agent", label: "Autonomous Agent", desc: "Multi-step reasoning" },
  { id: "flutter", label: "Flutter App", desc: "Cross-platform client" },
  { id: "tuning", label: "LLM Fine-Tuning", desc: "PEFT/LoRA domain model" },
  { id: "consulting", label: "Custom Systems", desc: "Distributed & Backend" },
] as const;

const scales = [
  { id: "mvp", label: "MVP / Prototype", desc: "Build & validate fast (2–3 weeks)" },
  { id: "production", label: "Production Ready", desc: "Robust & scalable (1–2 months)" },
  { id: "enterprise", label: "Enterprise Scale", desc: "High traffic & security (3+ months)" },
] as const;

const goals = [
  { id: "speed", label: "Rapid Delivery & Cost", desc: "Launch quickly under budget" },
  { id: "latency", label: "Sub-150ms Low Latency", desc: "Milliseconds retrieval speed" },
  { id: "robustness", label: "100% Failover & Safety", desc: "Consensus-level resilience" },
] as const;

const STACKS: Record<string, string[]> = {
  rag: ["Python", "LangChain", "Vector DB", "Embeddings", "RAG"],
  agent: ["Python", "LangChain", "Memory Chains", "Prompting", "Agents"],
  flutter: ["Flutter", "Dart", "REST APIs", "Mobile UI", "Cross-Platform"],
  tuning: ["Python", "HuggingFace", "PEFT", "LoRA", "LLaMA 3", "Mistral"],
  default: ["Python", "ZeroMQ", "Docker", "Firebase", "Distributed Systems"],
};

const PROOFS: Record<string, string> = {
  rag: "Nutankumar built a production RAG pipeline at KAM Global AI with a 120ms query latency.",
  agent:
    "Nutankumar designed 4 autonomous LangChain agents with memory chains and dynamic tools.",
  flutter:
    "Nutankumar built cross-platform mobile and web learning portals using Flutter and REST APIs.",
  tuning:
    "Nutankumar fine-tuned LLaMA 3 and Mistral instruct models for medical and legal domains.",
  default:
    "Nutankumar has built a 5-node Raft consensus cluster store with 100% automatic recovery.",
};

// Class strings must be literal — Tailwind cannot generate interpolated names.
const channels = [
  {
    key: "email",
    label: "Email address",
    glyph: "@",
    chip: "border-primary/30 bg-primary/10 text-primary",
    hover: "hover:text-primary",
  },
  {
    key: "phone",
    label: "Phone number",
    glyph: "☎",
    chip: "border-accent/30 bg-accent/10 text-accent",
    hover: "hover:text-accent",
  },
  {
    key: "linkedin",
    label: "LinkedIn profile",
    glyph: "in",
    chip: "border-secondary/30 bg-secondary/10 text-secondary",
    hover: "hover:text-secondary",
  },
] as const;

export function Contact() {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState<ProjectType>("");
  const [scale, setScale] = useState<Scale>("");
  const [keyGoal, setKeyGoal] = useState<Goal>("");

  const stack = STACKS[projectType] ?? STACKS.default;
  const proof = PROOFS[projectType] ?? PROOFS.default;

  const getMailtoLink = () => {
    const selectedType =
      projectTypes.find((p) => p.id === projectType)?.label || "Custom Build";
    const selectedScale = scales.find((s) => s.id === scale)?.label || "Production";
    const selectedGoal = goals.find((g) => g.id === keyGoal)?.label || "High Performance";

    const subject = encodeURIComponent(
      `Scoping Inquiry: ${selectedScale} ${selectedType}`
    );
    const body = encodeURIComponent(
      `Hi Nutankumar,\n\nI scoped a project on your portfolio Scoping Estimator:\n\n` +
        `- Project Type: ${selectedType}\n` +
        `- Scale: ${selectedScale}\n` +
        `- Primary Objective: ${selectedGoal}\n` +
        `- Recommended Stack: ${stack.join(", ")}\n\n` +
        `Let's schedule a call to talk about implementation details!\n\nBest,\n[Name]\n[Company]`
    );
    return `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const resetEstimator = () => {
    setProjectType("");
    setScale("");
    setKeyGoal("");
    setStep(1);
  };

  const contactHref = {
    email: `mailto:${profile.email}`,
    phone: `tel:${profile.phone}`,
    linkedin: profile.linkedin,
  };
  const contactValue = {
    email: profile.email,
    phone: profile.phone,
    linkedin: "linkedin.com/in/nutankumarkm",
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-0"
    >
      <MorphBlobLines
        className="pointer-events-none absolute left-1/3 top-1/2 aspect-square w-[min(70vw,600px)] -translate-x-1/2 -translate-y-1/2 opacity-15"
        color="var(--color-primary)"
        duration={24}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col items-center justify-center gap-3 text-center">
          <span className="h-px w-10 bg-primary/60" />
          <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-primary">
            <ScrambleText text="Collaboration" trigger="view" />
          </span>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Let&apos;s build <span className="gradient-text">something rare.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Direct contact */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6 lg:sticky lg:top-32"
          >
            <h3 className="font-display text-2xl font-bold">Direct Contact</h3>
            <p className="max-w-md text-sm leading-relaxed text-base-content/70">
              I am open to full-time AI engineering roles, high-complexity contract
              builds, or research collaborations in distributed consensus.
            </p>

            <ul className="list rounded-box border border-base-300 bg-base-200/40 backdrop-blur-md">
              {channels.map((c) => (
                <li key={c.key} className="list-row">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full border font-mono-display text-xs ${c.chip}`}
                    aria-hidden
                  >
                    {c.glyph}
                  </div>
                  <div>
                    <div className="font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                      {c.label}
                    </div>
                    <Magnetic
                      as="a"
                      href={contactHref[c.key]}
                      strength={0.25}
                      dataCursor="hover"
                      className={`link link-hover text-sm font-semibold ${c.hover}`}
                    >
                      {contactValue[c.key]}
                    </Magnetic>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Scoping estimator */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card relative min-h-[460px] overflow-hidden border border-base-300 bg-base-200/50 shadow-2xl backdrop-blur-md transition-colors duration-300 hover:border-base-content/20"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

            <div className="card-body justify-between gap-6">
              <div>
                {/* Header */}
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-base-300 pb-4">
                  <div>
                    <span className="font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                      Consulting Planner
                    </span>
                    <h4 className="mt-0.5 text-base font-bold">
                      {step === 4 ? "Project Scope Verified" : "Scope & Estimate Project"}
                    </h4>
                  </div>
                  {step <= 3 && (
                    <span className="badge badge-primary badge-soft font-mono-display text-xs font-bold">
                      Step {step} of 3
                    </span>
                  )}
                </div>

                {/* Stepper */}
                <ul className="steps mb-6 w-full text-[10px]">
                  {["Type", "Scale", "Target", "Scope"].map((label, i) => (
                    <li
                      key={label}
                      className={`step font-mono-display uppercase tracking-wider ${
                        step >= i + 1 ? "step-primary" : ""
                      }`}
                    >
                      {label}
                    </li>
                  ))}
                </ul>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-4"
                    >
                      <span className="font-display text-sm font-semibold">
                        What are we building?
                      </span>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {projectTypes.map((opt) => (
                          <button
                            key={opt.id}
                            data-cursor="hover"
                            onClick={() => {
                              setProjectType(opt.id);
                              setStep(2);
                            }}
                            className={`btn h-auto flex-col items-start gap-1 border-base-300 py-3 text-left font-normal ${
                              projectType === opt.id ? "btn-primary btn-soft" : "btn-ghost"
                            }`}
                          >
                            <span className="font-display text-xs font-semibold">
                              {opt.label}
                            </span>
                            <span className="font-mono-display text-[9px] uppercase tracking-wide opacity-60">
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setStep(1)}
                          className="btn btn-ghost btn-xs font-mono-display"
                        >
                          ◀ Back
                        </button>
                        <span className="font-display text-sm font-semibold">
                          What is the scale of the engagement?
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {scales.map((opt) => (
                          <button
                            key={opt.id}
                            data-cursor="hover"
                            onClick={() => {
                              setScale(opt.id);
                              setStep(3);
                            }}
                            className={`btn h-auto flex-col items-start gap-0.5 border-base-300 py-3 text-left font-normal ${
                              scale === opt.id ? "btn-primary btn-soft" : "btn-ghost"
                            }`}
                          >
                            <span className="font-display text-xs font-semibold">
                              {opt.label}
                            </span>
                            <span className="text-xs opacity-60">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setStep(2)}
                          className="btn btn-ghost btn-xs font-mono-display"
                        >
                          ◀ Back
                        </button>
                        <span className="font-display text-sm font-semibold">
                          What is the key performance target?
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {goals.map((opt) => (
                          <button
                            key={opt.id}
                            data-cursor="hover"
                            onClick={() => {
                              setKeyGoal(opt.id);
                              setStep(4);
                            }}
                            className={`btn h-auto flex-col items-start gap-0.5 border-base-300 py-3 text-left font-normal ${
                              keyGoal === opt.id ? "btn-primary btn-soft" : "btn-ghost"
                            }`}
                          >
                            <span className="font-display text-xs font-semibold">
                              {opt.label}
                            </span>
                            <span className="text-xs opacity-60">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col gap-5"
                    >
                      <div className="rounded-box border border-base-300 bg-base-100/50 p-4">
                        <span className="font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                          Project Description
                        </span>
                        <p className="mt-1.5 text-xs font-medium leading-relaxed sm:text-sm">
                          Scoping a{" "}
                          <span className="text-primary">
                            {scales.find((s) => s.id === scale)?.label}
                          </span>{" "}
                          deployment of a{" "}
                          <span className="text-primary">
                            {projectTypes.find((p) => p.id === projectType)?.label}
                          </span>{" "}
                          optimizing for{" "}
                          <span className="text-primary">
                            {goals.find((g) => g.id === keyGoal)?.label}
                          </span>
                          .
                        </p>
                      </div>

                      <div>
                        <span className="font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                          Recommended Engineering Stack
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {stack.map((s) => (
                            <span
                              key={s}
                              className="badge badge-outline badge-sm font-mono-display text-[10px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-l-2 border-primary/50 pl-3">
                        <span className="block font-mono-display text-[9px] font-semibold uppercase tracking-wider text-primary">
                          Nutankumar&apos;s Experience Proof
                        </span>
                        <p className="mt-1 text-[11px] leading-relaxed text-base-content/70">
                          {proof}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {step === 4 && (
                <div className="card-actions gap-3">
                  <button
                    onClick={resetEstimator}
                    className="btn btn-outline btn-sm font-mono-display text-[10px] uppercase tracking-wider"
                  >
                    Reset
                  </button>
                  <a
                    href={getMailtoLink()}
                    data-cursor="hover"
                    className="btn btn-primary flex-1 font-mono-display text-xs font-bold uppercase tracking-widest"
                  >
                    Send Scoped Proposal
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
