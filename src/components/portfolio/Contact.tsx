"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/lib/portfolio-data";
import { Magnetic } from "./Magnetic";
import { MorphBlobLines } from "./MorphBlob";
import { ScrambleText } from "./ScrambleText";

export function Contact() {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState<"rag" | "agent" | "flutter" | "tuning" | "consulting" | "">("");
  const [scale, setScale] = useState<"mvp" | "production" | "enterprise" | "">("");
  const [keyGoal, setKeyGoal] = useState<"speed" | "latency" | "robustness" | "">("");

  // Scoping choices
  const projectTypes = [
    { id: "rag", label: "RAG Pipeline", color: "var(--cyan)", desc: "120ms search indexing" },
    { id: "agent", label: "Autonomous Agent", color: "var(--lime)", desc: "Multi-step reasoning" },
    { id: "flutter", label: "Flutter App", color: "var(--magenta)", desc: "Cross-platform client" },
    { id: "tuning", label: "LLM Fine-Tuning", color: "var(--amber)", desc: "PEFT/LoRA domain model" },
    { id: "consulting", label: "Custom Systems", color: "var(--violet)", desc: "Distributed & Backend" },
  ];

  const scales = [
    { id: "mvp", label: "MVP / Prototype", desc: "Build & validate fast (2-3 weeks)" },
    { id: "production", label: "Production Ready", desc: "Robust & scalable (1-2 months)" },
    { id: "enterprise", label: "Enterprise Scale", desc: "High traffic & security (3+ months)" },
  ];

  const goals = [
    { id: "speed", label: "Rapid Delivery & Cost", desc: "Launch quickly under budget" },
    { id: "latency", label: "Sub-150ms Low Latency", desc: "Milliseconds retrieval speed" },
    { id: "robustness", label: "100% Failover & Safety", desc: "Consensus-level resilience" },
  ];

  // Dynamic stack and proof resolution
  const getDynamicStack = () => {
    switch (projectType) {
      case "rag":
        return ["Python", "LangChain", "Vector DB", "Embeddings", "RAG"];
      case "agent":
        return ["Python", "LangChain", "Memory Chains", "Prompting", "Agents"];
      case "flutter":
        return ["Flutter", "Dart", "REST APIs", "Mobile UI", "Cross-Platform"];
      case "tuning":
        return ["Python", "HuggingFace", "PEFT", "LoRA", "LLaMA 3", "Mistral"];
      default:
        return ["Python", "ZeroMQ", "Docker", "Firebase", "Distributed Systems"];
    }
  };

  const getDynamicProof = () => {
    switch (projectType) {
      case "rag":
        return "Nutankumar built a production RAG pipeline at KAM Global AI with a 120ms query latency.";
      case "agent":
        return "Nutankumar designed 4 autonomous LangChain agents with memory chains and dynamic tools.";
      case "flutter":
        return "Nutankumar built cross-platform mobile and web learning portals using Flutter and REST APIs.";
      case "tuning":
        return "Nutankumar fine-tuned LLaMA 3 and Mistral instruct models for medical and legal domains.";
      default:
        return "Nutankumar has built a 5-node Raft consensus cluster store with 100% automatic recovery.";
    }
  };

  const getMailtoLink = () => {
    const selectedType = projectTypes.find((p) => p.id === projectType)?.label || "Custom Build";
    const selectedScale = scales.find((s) => s.id === scale)?.label || "Production";
    const selectedGoal = goals.find((g) => g.id === keyGoal)?.label || "High Performance";
    const stack = getDynamicStack().join(", ");

    const subject = encodeURIComponent(`Scoping Inquiry: ${selectedScale} ${selectedType}`);
    const body = encodeURIComponent(
      `Hi Nutankumar,\n\nI scoped a project on your portfolio Scoping Estimator:\n\n` +
      `- Project Type: ${selectedType}\n` +
      `- Scale: ${selectedScale}\n` +
      `- Primary Objective: ${selectedGoal}\n` +
      `- Recommended Stack: ${stack}\n\n` +
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

  return (
    <section
      id="contact"
      className="relative lg:min-h-screen lg:flex lg:flex-col lg:justify-center py-20 lg:py-0 px-4 sm:px-6 lg:px-8 overflow-hidden bg-ink-950/20"
    >
      {/* Background morph blobs */}
      <MorphBlobLines
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[min(70vw,600px)] aspect-square opacity-15 pointer-events-none"
        color="var(--lime)"
        duration={24}
      />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,255,58,0.05), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center text-center gap-3 mb-16">
          <span className="h-px w-10 bg-lime/60" />
          <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-lime">
            <ScrambleText text="Collaboration" trigger="view" />
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight mt-2">
            Let&apos;s build <span className="gradient-text">something rare.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-start">
          {/* Left Column: Traditional Contact Info */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-32">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Direct Contact
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              I am open to full-time AI engineering roles, high-complexity contract builds, or research collaborations in distributed consensus.
            </p>

            <div className="flex flex-col gap-5 mt-4">
              <Magnetic
                as="a"
                href={`mailto:${profile.email}`}
                strength={0.25}
                dataCursor="view"
                dataCursorLabel="Email"
                className="group flex items-center gap-4 rounded-xl border border-hairline bg-surface p-4 hover:border-lime/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center font-mono-display text-xs text-lime">
                  @
                </div>
                <div>
                  <div className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground">
                    Email address
                  </div>
                  <div className="text-sm font-semibold text-foreground group-hover:text-lime transition-colors">
                    {profile.email}
                  </div>
                </div>
              </Magnetic>

              <Magnetic
                as="a"
                href={`tel:${profile.phone}`}
                strength={0.25}
                dataCursor="hover"
                className="group flex items-center gap-4 rounded-xl border border-hairline bg-surface p-4 hover:border-cyan-acc/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-cyan-acc/10 border border-cyan-acc/30 flex items-center justify-center font-mono-display text-xs text-cyan-acc">
                  📞
                </div>
                <div>
                  <div className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </div>
                  <div className="text-sm font-semibold text-foreground group-hover:text-cyan-acc transition-colors">
                    {profile.phone}
                  </div>
                </div>
              </Magnetic>

              <Magnetic
                as="a"
                href={profile.linkedin}
                strength={0.25}
                dataCursor="hover"
                className="group flex items-center gap-4 rounded-xl border border-hairline bg-surface p-4 hover:border-magenta/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-magenta/10 border border-magenta/30 flex items-center justify-center font-mono-display text-xs text-magenta">
                  in
                </div>
                <div>
                  <div className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground">
                    LinkedIn profile
                  </div>
                  <div className="text-sm font-semibold text-foreground group-hover:text-magenta transition-colors">
                    linkedin.com/in/nutankumarkm
                  </div>
                </div>
              </Magnetic>
            </div>
          </div>

          {/* Right Column: Project Scoping Estimator */}
          <div className="bg-surface border border-hairline rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
            {/* Morphing step background glow */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-lime/5 blur-3xl rounded-full pointer-events-none" />

            <div>
              {/* Header / Stepper Progress */}
              <div className="flex items-center justify-between mb-8 border-b border-hairline pb-4">
                <div>
                  <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground">
                    Consulting Planner
                  </span>
                  <h4 className="text-base font-bold text-foreground mt-0.5">
                    {step === 4 ? "Project Scope Verified" : "Scope & Estimate Project"}
                  </h4>
                </div>
                {step <= 3 && (
                  <span className="font-mono-display text-xs text-lime font-bold">
                    Step {step} of 3
                  </span>
                )}
              </div>

              {/* Step Contents */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <span className="font-display text-sm font-semibold text-foreground">
                      What are we building?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {projectTypes.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setProjectType(opt.id as any);
                            setStep(2);
                          }}
                          className={`text-left border border-hairline rounded-xl p-3.5 hover:bg-foreground/5 hover:border-lime/40 transition-all ${
                            projectType === opt.id ? "bg-lime/5 border-lime/60" : ""
                          }`}
                        >
                          <span className="block font-display text-xs font-semibold text-foreground">
                            {opt.label}
                          </span>
                          <span className="block font-mono-display text-[9px] text-muted-foreground mt-1 uppercase tracking-wide">
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
                        className="text-xs font-mono-display text-muted-foreground hover:text-foreground"
                      >
                        ◀ Back
                      </button>
                      <span className="font-display text-sm font-semibold text-foreground">
                        What is the scale of the engagement?
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {scales.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setScale(opt.id as any);
                            setStep(3);
                          }}
                          className={`text-left border border-hairline rounded-xl p-4 hover:bg-foreground/5 hover:border-lime/40 transition-all ${
                            scale === opt.id ? "bg-lime/5 border-lime/60" : ""
                          }`}
                        >
                          <span className="block font-display text-xs font-semibold text-foreground">
                            {opt.label}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {opt.desc}
                          </span>
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
                        className="text-xs font-mono-display text-muted-foreground hover:text-foreground"
                      >
                        ◀ Back
                      </button>
                      <span className="font-display text-sm font-semibold text-foreground">
                        What is the key performance target?
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {goals.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setKeyGoal(opt.id as any);
                            setStep(4);
                          }}
                          className={`text-left border border-hairline rounded-xl p-4 hover:bg-foreground/5 hover:border-lime/40 transition-all ${
                            keyGoal === opt.id ? "bg-lime/5 border-lime/60" : ""
                          }`}
                        >
                          <span className="block font-display text-xs font-semibold text-foreground">
                            {opt.label}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {opt.desc}
                          </span>
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
                    {/* Summary */}
                    <div className="bg-ink-950/30 border border-hairline rounded-xl p-4">
                      <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground">
                        Project Description
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-foreground mt-1.5 leading-relaxed">
                        Scoping a{" "}
                        <span className="text-lime">
                          {scales.find((s) => s.id === scale)?.label}
                        </span>{" "}
                        deployment of a{" "}
                        <span className="text-lime">
                          {projectTypes.find((p) => p.id === projectType)?.label}
                        </span>{" "}
                        optimizing for{" "}
                        <span className="text-lime">
                          {goals.find((g) => g.id === keyGoal)?.label}
                        </span>
                        .
                      </p>
                    </div>

                    {/* Dynamic Stack */}
                    <div>
                      <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground">
                        Recommended Engineering Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {getDynamicStack().map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 border border-hairline rounded text-[10px] font-mono text-muted-foreground bg-ink-950/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Relevant past work proof */}
                    <div className="border-l-2 border-lime/50 pl-3">
                      <span className="font-mono-display text-[9px] uppercase tracking-wider text-lime block font-semibold">
                        Nutankumar's Experience Proof
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {getDynamicProof()}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTAs */}
            {step === 4 && (
              <div className="flex gap-3 mt-8">
                <button
                  onClick={resetEstimator}
                  className="px-4 py-2.5 rounded-xl border border-hairline font-mono-display text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset
                </button>
                <a
                  href={getMailtoLink()}
                  data-cursor="hover"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-lime py-3 text-xs font-mono-display uppercase tracking-widest font-bold text-background hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Send Scoped Proposal
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
