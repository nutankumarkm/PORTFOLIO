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
      text: "Hi! I am Nutankumar's virtual assistant. Click one of the questions below or type anything to learn about his projects, experience, and skills!",
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

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    setInputText("");

    // Trigger typing state
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botResponse = getBotResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: botResponse, isTypewriter: true }
      ]);
    }, 700);
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
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[90] hidden md:block">
        <Magnetic strength={0.25} dataCursor="hover">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative h-14 w-14 rounded-full bg-lime text-background shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Toggle chat assistant"
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-acc opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-acc"></span>
            </span>
          </button>
        </Magnetic>
      </div>

      {/* Mobile-friendly Button */}
      <div className="fixed bottom-4 right-4 z-[90] md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-12 w-12 rounded-full bg-lime text-background shadow-lg flex items-center justify-center"
          aria-label="Toggle chat assistant"
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>

      {/* Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-[95] w-[calc(100vw-32px)] sm:w-[400px] h-[550px] rounded-2xl border border-hairline bg-surface-2/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 rounded-full border border-lime/40 bg-lime/10 flex items-center justify-center font-display text-[10px] font-bold text-lime">
                  NK
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground leading-none">Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
                    <span className="font-mono-display text-[8px] uppercase tracking-wider text-lime">Offline Bot</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 select-text scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-lime text-background font-medium rounded-tr-none"
                        : "border border-hairline bg-surface rounded-tl-none text-foreground"
                    }`}
                  >
                    {msg.sender === "bot" && msg.isTypewriter ? (
                      <Typewriter
                        text={msg.text}
                        onComplete={() => {
                          // Clean typewriter state once animation is complete
                          setMessages((prev) =>
                            prev.map((m) => (m.id === msg.id ? { ...m, isTypewriter: false } : m))
                          );
                        }}
                      />
                    ) : (
                      <span className="whitespace-pre-line">{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing state */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-hairline bg-surface px-4 py-3 text-sm flex items-center gap-1.5">
                    <span className="font-mono-display text-[10px] text-muted-foreground mr-1">Typing</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-lime animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-lime animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-lime animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Box */}
            <div className="px-5 py-3 border-t border-hairline bg-surface/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-display text-[8px] uppercase tracking-widest text-muted-foreground">
                  Suggested Questions
                </span>
                <button
                  onClick={shuffleSuggestions}
                  className="flex items-center gap-1 text-muted-foreground hover:text-lime transition-colors"
                  title="Shuffle questions"
                >
                  <RotateCw className="h-3 w-3" />
                  <span className="font-mono-display text-[8px] uppercase tracking-wider">Shuffle</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                {suggestions.map((item) => (
                  <button
                    key={item.question}
                    onClick={() => handleSend(item.question)}
                    className="text-left rounded-lg border border-hairline bg-surface-2 hover:bg-lime/5 hover:border-lime/40 px-2.5 py-1.5 font-sans text-[11px] text-muted-foreground hover:text-lime leading-tight transition-all duration-200"
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="p-4 border-t border-hairline bg-surface/50 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me about RAG, Raft, or email..."
                className="flex-1 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-9 w-9 rounded-full bg-lime text-background flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-transform"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
