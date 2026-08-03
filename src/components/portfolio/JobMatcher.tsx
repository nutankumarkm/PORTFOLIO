"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, CheckCircle, Briefcase, Mail } from "lucide-react";
import { skillGroups, profile } from "@/lib/portfolio-data";

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

  const strong = (result?.score ?? 0) > 75;

  return (
    <section
      id="jobmatcher"
      className="relative overflow-hidden border-t border-base-300 px-4 py-20 sm:px-6 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8 lg:py-0"
    >
      {/* Score-reactive background glow */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[140px] transition-colors duration-700 ${
          result ? (strong ? "bg-primary" : "bg-accent") : "bg-base-content/20"
        }`}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-accent">
            03.5 / Suitability
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Job Fit Analyzer
          </h2>
          <p className="mt-4 text-sm text-base-content/70 sm:text-base">
            Recruiter shortcut: paste a job description below to instantly check
            compatibility, matched skill sets, and relevant projects.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Input */}
          <div className="flex flex-col gap-6">
            <div className="card border border-base-300 bg-base-200/50 shadow-xl backdrop-blur-md">
              <div className="card-body">
                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend flex w-full items-center justify-between gap-2 font-mono-display text-[9px] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-accent" />
                      Paste Job Description
                    </span>
                    {jdText && (
                      <button
                        onClick={() => setJdText("")}
                        className="btn btn-ghost btn-xs font-mono-display text-[9px] uppercase tracking-wider"
                      >
                        Clear
                      </button>
                    )}
                  </legend>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="We are looking for an AI Engineer with experience building RAG pipelines, autonomous agents, and fine-tuning open-source models using LangChain and Python..."
                    className="textarea textarea-lg h-44 w-full resize-none font-sans text-sm focus:textarea-accent"
                  />
                  <p className="label font-mono-display text-[9px] uppercase tracking-wider">
                    Analyzed locally in your browser — nothing is uploaded.
                  </p>
                </fieldset>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                Or load a preset job description:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => applyPreset(preset.text)}
                    data-cursor="hover"
                    className="btn btn-outline btn-sm font-medium"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="h-full">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="card relative overflow-hidden border border-base-300 bg-base-200/60 shadow-2xl backdrop-blur-md"
                >
                  <div className="card-body gap-6">
                    {/* Score */}
                    <div className="flex items-center gap-5">
                      <div
                        className={`radial-progress shrink-0 ${
                          strong ? "text-primary" : "text-accent"
                        }`}
                        style={
                          {
                            "--value": result.score,
                            "--size": "5rem",
                            "--thickness": "5px",
                          } as React.CSSProperties
                        }
                        role="progressbar"
                        aria-valuenow={result.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span className="font-display text-lg font-bold text-base-content">
                          {result.score}%
                        </span>
                      </div>

                      <div>
                        <span className="flex items-center gap-1 font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                          <Sparkles className="h-3 w-3 text-primary" /> Match Rating
                        </span>
                        <h4 className="mt-0.5 text-base font-bold">
                          {result.score > 80
                            ? "Excellent Candidate Match"
                            : result.score > 60
                              ? "Highly Qualified"
                              : "Qualified Software Engineer"}
                        </h4>
                        <p className="mt-1 text-[11px] leading-relaxed text-base-content/70">
                          {result.summary}
                        </p>
                      </div>
                    </div>

                    {/* Matched competencies */}
                    <div>
                      <span className="mb-2 block font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                        Matched Competencies ({result.matchedKeywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedKeywords.length > 0 ? (
                          result.matchedKeywords.map((k) => (
                            <span
                              key={k}
                              className="badge badge-primary badge-soft badge-sm gap-1 font-mono-display text-[10px]"
                            >
                              <CheckCircle className="h-2.5 w-2.5" />
                              {k}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-base-content/60">
                            No direct framework keywords detected yet. Keep typing…
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Relevant projects */}
                    {result.recommendedProjects.length > 0 && (
                      <div>
                        <span className="mb-2 block font-mono-display text-[9px] uppercase tracking-wider text-base-content/60">
                          Relevant Projects & Proof
                        </span>
                        <ul className="list rounded-box bg-base-100/50">
                          {result.recommendedProjects.map((p) => (
                            <li key={p} className="list-row py-2.5">
                              <Briefcase className="h-4 w-4 shrink-0 text-accent" />
                              <span className="text-xs font-medium leading-snug">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="card-actions">
                      <a
                        href={getMailtoLink()}
                        data-cursor="hover"
                        className="btn btn-primary btn-block gap-2 text-sm font-bold"
                      >
                        <Mail className="h-4 w-4" />
                        Email Nutankumar for this Role
                      </a>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="card card-dash h-full min-h-[300px] items-center justify-center border-base-300 bg-base-200/20 text-center">
                  <div className="card-body items-center justify-center">
                    <FileText className="mb-3 h-10 w-10 text-base-content/30" />
                    <p className="font-display text-sm font-medium">
                      Awaiting Job Description
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-base-content/60">
                      Paste text or click one of the quick presets on the left to
                      analyze candidate compatibility dynamically.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
