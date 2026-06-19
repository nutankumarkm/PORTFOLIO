"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, CheckCircle, Briefcase, Mail } from "lucide-react";
import { skillGroups, accentHex, type AccentColor, profile } from "@/lib/portfolio-data";

interface MatchResult {
  score: number;
  matchedKeywords: string[];
  matchedCategories: string[];
  recommendedProjects: string[];
  summary: string;
}

// Tech keywords mapped to projects and skills
const KEYWORD_MAP: Record<string, { label: string; projects: string[]; category: string }> = {
  // LLM & RAG
  rag: { label: "RAG Pipelines", projects: ["MCP-Powered AI Developer Assistant", "Fine-Tuned Domain LLMs"], category: "llm-rag" },
  retrieval: { label: "RAG Pipelines", projects: ["MCP-Powered AI Developer Assistant"], category: "llm-rag" },
  vector: { label: "Vector Databases", projects: ["MCP-Powered AI Developer Assistant"], category: "llm-rag" },
  embeddings: { label: "Vector Databases", projects: ["MCP-Powered AI Developer Assistant"], category: "llm-rag" },
  langchain: { label: "LangChain", projects: ["MCP-Powered AI Developer Assistant", "Fine-Tuned Domain LLMs"], category: "llm-rag" },
  agent: { label: "Autonomous Agents", projects: ["MCP-Powered AI Developer Assistant"], category: "llm-rag" },
  agents: { label: "Autonomous Agents", projects: ["MCP-Powered AI Developer Assistant"], category: "llm-rag" },
  mcp: { label: "MCP Protocol", projects: ["MCP-Powered AI Developer Assistant"], category: "llm-rag" },
  llama: { label: "LLaMA 3", projects: ["Fine-Tuned Domain LLMs"], category: "llm-rag" },
  mistral: { label: "Mistral", projects: ["Fine-Tuned Domain LLMs"], category: "llm-rag" },
  huggingface: { label: "HuggingFace", projects: ["Fine-Tuned Domain LLMs"], category: "llm-rag" },
  peft: { label: "PEFT/LoRA Fine-tuning", projects: ["Fine-Tuned Domain LLMs"], category: "llm-rag" },
  lora: { label: "PEFT/LoRA Fine-tuning", projects: ["Fine-Tuned Domain LLMs"], category: "llm-rag" },
  "fine-tuning": { label: "Fine-Tuning", projects: ["Fine-Tuned Domain LLMs"], category: "llm-rag" },

  // AI & ML
  tensorflow: { label: "TensorFlow", projects: ["AI Proctoring System"], category: "ai-ml" },
  "scikit-learn": { label: "Scikit-learn", projects: ["AI Proctoring System"], category: "ai-ml" },
  nlp: { label: "NLP", projects: ["Fine-Tuned Domain LLMs"], category: "ai-ml" },
  opencv: { label: "OpenCV", projects: ["AI Proctoring System"], category: "ai-ml" },
  mediapipe: { label: "MediaPipe", projects: ["AI Proctoring System"], category: "ai-ml" },
  vision: { label: "Computer Vision", projects: ["AI Proctoring System"], category: "ai-ml" },

  // App Dev
  flutter: { label: "Flutter Mobile/Web", projects: ["AI Proctoring System"], category: "app-dev" },
  dart: { label: "Flutter Mobile/Web", projects: ["AI Proctoring System"], category: "app-dev" },
  mobile: { label: "Application Dev", projects: ["AI Proctoring System"], category: "app-dev" },
  android: { label: "Application Dev", projects: ["AI Proctoring System"], category: "app-dev" },
  "cross-platform": { label: "Application Dev", projects: ["AI Proctoring System"], category: "app-dev" },

  // Distributed Systems / Cloud
  raft: { label: "Raft Consensus", projects: ["Raft Distributed Key-Value Store"], category: "infra" },
  consensus: { label: "Raft Consensus", projects: ["Raft Distributed Key-Value Store"], category: "infra" },
  zeromq: { label: "ZeroMQ", projects: ["Raft Distributed Key-Value Store"], category: "infra" },
  docker: { label: "Docker", projects: ["Raft Distributed Key-Value Store"], category: "infra" },
  firebase: { label: "Firebase Backend", projects: ["AI Proctoring System"], category: "infra" },
  mongodb: { label: "MongoDB", projects: [], category: "infra" },

  // Languages
  python: { label: "Python", projects: ["Raft Distributed Key-Value Store", "MCP-Powered AI Developer Assistant", "Fine-Tuned Domain LLMs"], category: "languages" },
  cpp: { label: "C++", projects: [], category: "languages" },
  java: { label: "Java", projects: [], category: "languages" },
  javascript: { label: "JavaScript", projects: [], category: "languages" },
  typescript: { label: "TypeScript", projects: [], category: "languages" },
};

const PRESETS = [
  {
    title: "AI & RAG Engineer",
    text: "Looking for an AI Engineer to design and deploy LangChain agents and low-latency RAG pipelines. Experience building vector search indices, using LLaMA models, and writing optimized Python query flows is required."
  },
  {
    title: "Flutter & Mobile Developer",
    text: "Seeking a senior Flutter mobile app developer. You will build and scale high-fidelity cross-platform Android/iOS applications, integrate Firebase for datastores and proctoring logs, and hook up REST APIs."
  },
  {
    title: "Distributed Systems Builder",
    text: "We need an engineer to construct a fault-tolerant backend cluster. Familiarity with consensus protocols like Raft, socket-level networking (ZeroMQ), containers (Docker), and python scripting is critical."
  }
];

export function JobMatcher() {
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);

  // Keyword extraction matching
  useEffect(() => {
    if (!jdText.trim()) {
      setResult(null);
      return;
    }

    const cleanText = jdText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, " ");
    const words = cleanText.split(/\s+/);

    const matchedKeywords: string[] = [];
    const matchedCategoriesSet = new Set<string>();
    const recommendedProjectsSet = new Set<string>();

    Object.keys(KEYWORD_MAP).forEach((key) => {
      // Check if word or phrase exists in text
      if (words.includes(key) || cleanText.includes(` ${key} `) || cleanText.startsWith(`${key} `)) {
        matchedKeywords.push(KEYWORD_MAP[key].label);
        matchedCategoriesSet.add(KEYWORD_MAP[key].category);
        KEYWORD_MAP[key].projects.forEach((proj) => recommendedProjectsSet.add(proj));
      }
    });

    const uniqueKeywords = Array.from(new Set(matchedKeywords));
    const uniqueCategories = Array.from(matchedCategoriesSet);
    const recommendedProjects = Array.from(recommendedProjectsSet);

    // Dynamic scoring formula
    let score = 0;
    
    // Identify target roles
    const textLower = jdText.toLowerCase();
    const isAi = textLower.includes("ai") || 
                 textLower.includes("artificial intelligence") || 
                 textLower.includes("generative") ||
                 textLower.includes("llm") || 
                 textLower.includes("rag") ||
                 textLower.includes("langchain") ||
                 textLower.includes("agent") ||
                 textLower.includes("copilot");
                 
    const isMl = textLower.includes("ml") || 
                 textLower.includes("machine learning") || 
                 textLower.includes("nlp") || 
                 textLower.includes("computer vision") || 
                 textLower.includes("deep learning") ||
                 textLower.includes("data scientist") ||
                 textLower.includes("data science");
                 
    const isSde = textLower.includes("sde") || 
                  textLower.includes("software") || 
                  textLower.includes("developer") || 
                  textLower.includes("engineer") || 
                  textLower.includes("programmer") ||
                  textLower.includes("coder") ||
                  textLower.includes("development") ||
                  textLower.includes("frontend") || 
                  textLower.includes("backend") || 
                  textLower.includes("fullstack") || 
                  textLower.includes("full stack");

    const isTargetRole = isAi || isMl || isSde;

    if (uniqueKeywords.length > 0) {
      if (isTargetRole) {
        // Map target roles to a realistic score between 80% and 90% inclusive
        score = 80 + Math.min(10, Math.round((uniqueKeywords.length / 6) * 10));
      } else {
        score = Math.min(100, Math.round((uniqueKeywords.length / 7) * 55 + 40));
      }
    } else {
      score = isTargetRole ? 80 : 30; // base score for target roles vs general text
    }

    // Dynamic summary text
    let summary = "Nutankumar is a strong fit for this role. ";
    if (score > 85) {
      summary += "He possesses direct production experience in almost all of your core requirements, specifically in LLM pipelines and systems design.";
    } else if (score > 60) {
      summary += "He covers several key aspects of your tech stack and has proven project experience to bridge any gaps.";
    } else {
      summary += "He holds core software engineering fundamentals that cross-apply to your specifications.";
    }

    setResult({
      score,
      matchedKeywords: uniqueKeywords.slice(0, 8),
      matchedCategories: uniqueCategories,
      recommendedProjects: recommendedProjects.slice(0, 3),
      summary,
    });
  }, [jdText]);

  // Handle Preset Clicks
  const applyPreset = (text: string) => {
    setJdText(text);
  };

  // Pre-configured Mailto Link
  const getMailtoLink = () => {
    const jobTitle = jdText.split("\n")[0]?.slice(0, 40) || "AI/Systems Engineering Role";
    const subject = encodeURIComponent(`Inquiry regarding ${jobTitle} - KM Nutankumar`);
    const body = encodeURIComponent(
      `Hi Nutankumar,\n\nI scanned our Job Description on your portfolio Compatibility Matcher and found a ${
        result?.score || 0
      }% fit!\n\nHere are some of the matched requirements we are looking for:\n${(
        result?.matchedKeywords || []
      )
        .map((k) => `- ${k}`)
        .join("\n")}\n\nI'd love to discuss our opportunity with you.\n\nBest regards,\n[Your Name]\n[Company]`
    );
    return `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="jobmatcher" className="relative lg:min-h-screen lg:flex lg:flex-col lg:justify-center py-20 lg:py-0 px-4 sm:px-6 lg:px-8 border-t border-hairline overflow-hidden bg-ink-950/10">
      {/* Dynamic blurred bg glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[140px] opacity-10 rounded-full pointer-events-none transition-colors duration-700"
        style={{
          background: result
            ? result.score > 75
              ? "var(--lime)"
              : "var(--cyan)"
            : "rgba(255,255,255,0.03)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-cyan-acc">
            03.5 / Suitability
          </span>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Job Fit Analyzer
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            Recruiter shortcut: Paste a job description below to instantly check compatibility, matched skill sets, and relevant projects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">
          {/* Left Column: Input and Presets */}
          <div className="flex flex-col gap-6">
            <div className="relative bg-surface border border-hairline rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-cyan-acc" />
                  Paste Job Description
                </span>
                {jdText && (
                  <button
                    onClick={() => setJdText("")}
                    className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="We are looking for an AI Engineer with experience building RAG pipelines, autonomous agents, and fine-tuning open-source models using LangChain and Python..."
                className="w-full h-44 bg-ink-950/30 border border-hairline rounded-xl p-4 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-cyan-acc focus:ring-1 focus:ring-cyan-acc transition-colors resize-none font-sans"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground">
                Or load a preset job description:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => applyPreset(preset.text)}
                    data-cursor="hover"
                    className="rounded-xl border border-hairline bg-surface hover:bg-cyan-acc/5 hover:border-cyan-acc px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-cyan-acc transition-all"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Compatibility Results */}
          <div className="h-full">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-surface-2 border border-hairline rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                >
                  {/* Gauge & Score Header */}
                  <div className="flex items-center gap-5 mb-6">
                    {/* SVG Progress Ring */}
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-ink-600/30 fill-none"
                          strokeWidth="5"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="fill-none"
                          strokeWidth="5"
                          strokeDasharray="213.6"
                          initial={{ strokeDashoffset: 213.6 }}
                          animate={{ strokeDashoffset: 213.6 - (213.6 * result.score) / 100 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{
                            stroke: result.score > 75 ? "var(--lime)" : "var(--cyan)",
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-foreground">
                        {result.score}%
                      </div>
                    </div>

                    <div>
                      <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-lime" /> Match Rating
                      </span>
                      <h4 className="text-base font-bold text-foreground mt-0.5">
                        {result.score > 80
                          ? "Excellent Candidate Match"
                          : result.score > 60
                          ? "Highly Qualified"
                          : "Qualified Software Engineer"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {result.summary}
                      </p>
                    </div>
                  </div>

                  {/* Matched Badges */}
                  <div className="mb-6">
                    <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground block mb-2">
                      Matched Competencies ({result.matchedKeywords.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedKeywords.length > 0 ? (
                        result.matchedKeywords.map((k) => (
                          <span
                            key={k}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono border border-lime/30 bg-lime/5 text-lime"
                          >
                            <CheckCircle className="h-2.5 w-2.5" />
                            {k}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No direct framework keywords detected yet. Keep typing...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recommended Projects */}
                  {result.recommendedProjects.length > 0 && (
                    <div className="mb-6">
                      <span className="font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground block mb-2">
                        Relevant Projects & Proof
                      </span>
                      <div className="space-y-2">
                        {result.recommendedProjects.map((p) => (
                          <div
                            key={p}
                            className="flex items-center gap-2.5 bg-ink-950/20 border border-hairline rounded-xl p-3 text-xs"
                          >
                            <Briefcase className="h-4 w-4 text-cyan-acc flex-shrink-0" />
                            <span className="font-medium text-foreground leading-snug">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hiring Action Button */}
                  <a
                    href={getMailtoLink()}
                    data-cursor="hover"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime py-3 text-sm font-bold text-background hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <Mail className="h-4 w-4" />
                    Email Nutankumar for this Role
                  </a>
                </motion.div>
              ) : (
                <div className="h-full min-h-[300px] border border-hairline border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 text-muted-foreground bg-surface-2/20">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="font-display text-sm font-medium text-foreground">
                    Awaiting Job Description
                  </p>
                  <p className="text-xs max-w-xs mt-1">
                    Paste text or click one of the quick presets on the left to analyze candidate compatibility dynamically.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
