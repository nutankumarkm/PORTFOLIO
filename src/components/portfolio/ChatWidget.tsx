"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, RotateCw } from "lucide-react";
import { profile } from "@/lib/portfolio-data";
import { Magnetic } from "./Magnetic";

// Typewriter component for typing effect
function Typewriter({ text, speed = 10, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{displayed}</span>;
}

interface QAItem {
  question: string;
  keywords: string[];
  answer: string;
}

const QA_DATABASE: QAItem[] = [
  {
    question: "Tell me about your RAG project experience.",
    keywords: ["rag", "retrieval", "latency", "milvus", "pinecone", "chroma"],
    answer: "At KAM Global AI, I built a production RAG pipeline that achieved an average query latency of 120ms. I integrated vector databases and optimized retrieval using domain-specific knowledge bases to build high-accuracy question-answering systems."
  },
  {
    question: "What autonomous agents did you build?",
    keywords: ["agent", "agents", "langchain", "memory"],
    answer: "I built 4 autonomous agents using LangChain for LMS features. These agents are equipped with memory chains, dynamic prompt templates, and custom tool integrations, allowing them to perform multi-step learning and Q&A tasks in production."
  },
  {
    question: "Explain your Raft Consensus project.",
    keywords: ["raft", "consensus", "distributed", "zeromq", "docker", "cluster"],
    answer: "I built a 5-node Raft-based distributed key-value store from scratch in Python and ZeroMQ. It implements leader leases, log snapshotting, and crash recovery, achieving under 150ms commit latency and a 100% recovery rate after crash simulations."
  },
  {
    question: "What programming languages do you know?",
    keywords: ["languages", "code", "python", "java", "c", "c++", "javascript", "php", "sql"],
    answer: "I write clean, production code in Python, Java, C, C++, JavaScript, PHP, and SQL."
  },
  {
    question: "How can I contact you?",
    keywords: ["contact", "email", "phone", "linkedin", "call", "reach", "message"],
    answer: `You can reach me directly via: \n• Email: ${profile.email}\n• Phone: ${profile.phone}\n• LinkedIn: linkedin.com/in/nutankumarkm \nI'm open to AI engineering roles, contract builds, and research collaborations!`
  },
  {
    question: "Can I download your resume?",
    keywords: ["resume", "pdf", "download", "cv"],
    answer: "Yes! You can download my resume directly using the 'Download Resume' button located in the About section of this page, or click this link: /resume.pdf"
  },
  {
    question: "What was your role at KAM Global AI?",
    keywords: ["kam", "work", "job", "lms", "role", "experience"],
    answer: "I work as an AI Engineer at KAM Global AI within the AI-based LMS division. My focus is on intelligent learning systems, building RAG pipelines, fine-tuning task-specific LLMs, and deploying cross-platform AI products."
  },
  {
    question: "Where did you study?",
    keywords: ["study", "college", "education", "cgpa", "degree", "university", "tontadarya", "gadag"],
    answer: "I graduated with a B.E. in Computer Science and Design from Tontadarya College of Engineering, Gadag (2022 — 2026), achieving a cumulative CGPA of 8.0/10.0."
  },
  {
    question: "What was your IIITB internship about?",
    keywords: ["iiitb", "comet", "wireless", "5g", "6g", "internship", "research"],
    answer: "I was selected competitively as a Project Intern at IIITB COMET Foundation. My research focused on 5G and 6G wireless communication systems, which was awarded with a research stipend."
  },
  {
    question: "Do you build cross-platform mobile apps?",
    keywords: ["flutter", "mobile", "ios", "android", "app", "apps"],
    answer: "Yes, I build responsive mobile and web applications with integrated AI features using Flutter, Dart, and REST APIs, ensuring clean UI and performance."
  },
  {
    question: "What AI frameworks and tools do you use?",
    keywords: ["frameworks", "tools", "tensorflow", "scikit", "nlp", "pandas", "numpy", "huggingface", "peft", "lora", "mcp"],
    answer: "My toolset includes TensorFlow, Scikit-learn, HuggingFace (PEFT, LoRA for fine-tuning), LangChain, Vector databases, and Anthropic's Model Context Protocol (MCP)."
  },
  {
    question: "What databases do you specialize in?",
    keywords: ["database", "databases", "sqlite", "mongodb", "firebase", "firestore", "postgres", "vector"],
    answer: "I work with SQLite, Firebase Firestore, MongoDB, and various Vector databases for embeddings storage and RAG retrieval."
  },
  {
    question: "Are you open to remote opportunities?",
    keywords: ["remote", "work", "opportunities", "job", "role", "hire"],
    answer: "Yes! I am open to remote AI engineering roles, contract development work, and research collaborations globally."
  },
  {
    question: "What is your AI Proctoring project?",
    keywords: ["proctoring", "vision", "opencv", "mediapipe", "camera", "malpractice"],
    answer: "I built an AI Proctoring System featuring real-time face and gaze tracking to flag suspicious activities using OpenCV and MediaPipe. It uses a Flutter frontend and Firebase backend for reporting."
  },
  {
    question: "What machine learning models have you worked with?",
    keywords: ["models", "llama", "mistral", "llm", "fine-tune", "nlp"],
    answer: "I have experience fine-tuning LLaMA 3 and Mistral models using PEFT and LoRA. I also build customized natural language processing (NLP) pipelines."
  }
];

const getCommandAlias = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes("rag")) return "./execute --rag-experience";
  if (q.includes("agent") || q.includes("autonomous")) return "./execute --autonomous-agents";
  if (q.includes("raft")) return "./cat raft_consensus.md";
  if (q.includes("languages")) return "./list --languages";
  if (q.includes("contact")) return "./mail --nutankumar";
  if (q.includes("resume") || q.includes("download")) return "./curl --download-resume";
  if (q.includes("kam")) return "./cat work_history.json --kam";
  if (q.includes("study") || q.includes("education")) return "./cat education_details.txt";
  if (q.includes("iiitb")) return "./cat research_internship.pdf";
  if (q.includes("mobile") || q.includes("flutter")) return "./execute --mobile-dev";
  if (q.includes("frameworks") || q.includes("tools")) return "./list --ai-tools";
  if (q.includes("databases")) return "./list --db-spec";
  if (q.includes("remote")) return "./check --remote-openings";
  if (q.includes("proctoring")) return "./cat ai_proctoring.cpp";
  if (q.includes("machine learning") || q.includes("models")) return "./list --ml-models";
  return `./run --query="${question.slice(0, 15)}..."`;
};

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isTypewriter?: boolean;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am Nutan's AI Assistant. Ask me anything about his projects, experience, skills, or research, or select one of the topics below to get started.",
      isTypewriter: false
    }
  ]);
  const [suggestions, setSuggestions] = useState<QAItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load 5 random suggested questions
  const shuffleSuggestions = () => {
    const shuffled = [...QA_DATABASE].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 5));
  };

  useEffect(() => {
    shuffleSuggestions();
  }, []);

  // Scroll to bottom when messages list updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = Date.now().toString();
    const newUserMessage: Message = { id: userMsgId, sender: "user", text };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");

    // Trigger typing state
    setIsTyping(true);

    try {
      // Send conversation history to Next.js API
      const currentHistory = [...messages, newUserMessage];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: currentHistory
        }),
      });

      setIsTyping(false);

      if (!response.ok) {
        throw new Error("Failed to contact chatbot API");
      }

      const data = await response.json();
      const botResponse = data.reply || "No response received.";
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: botResponse, isTypewriter: true }
      ]);
    } catch (err) {
      console.warn("Chat API offline. Falling back to local offline search database...", err);
      setIsTyping(false);
      const botResponse = getBotResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: botResponse, isTypewriter: true }
      ]);
    }
  };

  const getBotResponse = (userInput: string): string => {
    const cleanInput = userInput.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "");
    const tokens = cleanInput.split(/\s+/);

    // 1. Direct match with predefined questions
    const exactMatch = QA_DATABASE.find(
      (item) => item.question.toLowerCase().replace(/[?]/g, "") === cleanInput.replace(/[?]/g, "")
    );
    if (exactMatch) return exactMatch.answer;

    // 2. Keyword matching
    let bestMatch: QAItem | null = null;
    let maxMatches = 0;

    for (const item of QA_DATABASE) {
      let matches = 0;
      for (const keyword of item.keywords) {
        if (tokens.includes(keyword) || cleanInput.includes(keyword)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = item;
      }
    }

    if (bestMatch && maxMatches > 0) {
      return bestMatch.answer;
    }

    // 3. Greetings
    const greetingKeywords = ["hi", "hello", "hey", "greetings", "yo", "sup"];
    if (tokens.some((token) => greetingKeywords.includes(token))) {
      return "Hello! How can I help you today? Ask me about my RAG pipeline, Raft simulation, education, or resume!";
    }

    // 4. Fallback
    return "I couldn't quite find an answer for that in my portfolio database. Try asking about 'RAG', 'Raft store', 'languages', or 'download resume'!";
  };

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6">
        <Magnetic strength={0.25} dataCursor="hover">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn btn-primary btn-circle btn-lg indicator shadow-xl"
            aria-label="Toggle chat assistant"
            aria-expanded={isOpen}
          >
            {!isOpen && (
              <span className="indicator-item">
                <span className="status status-accent animate-ping" />
              </span>
            )}
            {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </button>
        </Magnetic>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Portfolio assistant"
            className="card fixed bottom-24 right-4 z-[95] flex h-[580px] max-h-[calc(100svh-8rem)] w-[calc(100vw-32px)] flex-col overflow-hidden border border-base-300 bg-base-100/90 font-sans shadow-2xl backdrop-blur-xl sm:right-6 sm:w-[400px]"
          >
            {/* Header */}
            <div className="navbar min-h-0 select-none border-b border-base-300 bg-base-200 px-4 py-3">
              <div className="navbar-start gap-2.5">
                <span className="status status-success animate-pulse" aria-hidden />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold leading-tight tracking-tight">
                    Nutan&apos;s Copilot
                  </span>
                  <span className="text-[10px] leading-tight text-base-content/60">
                    Online // Ask anything
                  </span>
                </div>
              </div>
              <div className="navbar-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-xs btn-circle"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 select-text overflow-y-auto px-4 py-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble whitespace-pre-line text-[13px] leading-relaxed ${
                      msg.sender === "user" ? "chat-bubble-primary" : ""
                    }`}
                  >
                    {msg.sender === "bot" && msg.isTypewriter ? (
                      <>
                        <Typewriter
                          text={msg.text}
                          onComplete={() => {
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === msg.id ? { ...m, isTypewriter: false } : m
                              )
                            );
                          }}
                        />
                        <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-primary align-middle" />
                      </>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat chat-start">
                  <div className="chat-bubble">
                    <span className="loading loading-dots loading-sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested topics */}
            <div className="select-none border-t border-base-300 bg-base-200/50 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/60">
                  Suggested Topics
                </span>
                <button
                  onClick={shuffleSuggestions}
                  className="btn btn-ghost btn-xs gap-1 text-[10px]"
                  title="Shuffle topics"
                >
                  <RotateCw className="h-3 w-3" />
                  Shuffle
                </button>
              </div>
              <div className="flex max-h-[110px] flex-wrap gap-1.5 overflow-y-auto pr-1">
                {suggestions.map((item) => (
                  <button
                    key={item.question}
                    onClick={() => handleSend(item.question)}
                    className="btn btn-ghost btn-xs h-auto whitespace-normal border border-base-300 py-1.5 text-left text-[11px] font-normal leading-tight"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="join select-none border-t border-base-300 bg-base-200 p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question…"
                aria-label="Ask a question"
                className="input input-sm join-item flex-1 text-[13px] focus:input-primary"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn btn-primary btn-sm join-item"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


