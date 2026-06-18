// Portfolio content extracted from KM Nutankumar's resume.
// Hand-curated — no AI-generated content.

export const profile = {
  name: "KM Nutankumar",
  firstName: "Nutankumar",
  lastName: "KM",
  initials: "NK",
  role: "AI Engineer",
  roleAlt: "Systems Builder",
  location: "Bangalore, India",
  email: "nutankumarkm@gmail.com",
  phone: "+91 6363393589",
  linkedin: "https://linkedin.com/in/nutankumarkm",
  tagline:
    "I build production AI systems — RAG pipelines, autonomous agents, and cross-platform products that ship.",
  blurb:
    "Computer Science & Design engineer working at the intersection of large language models, distributed systems, and thoughtful product design. Currently shipping AI-based learning systems at KAM Global AI.",
  availability: "Open to select collaborations",
};

export const heroMetrics = [
  { value: "120ms", label: "RAG query latency", accent: "lime" },
  { value: "4", label: "Autonomous agents shipped", accent: "cyan" },
  { value: "8.0", label: "B.E. CGPA / 10", accent: "magenta" },
  { value: "150ms", label: "Raft commit latency", accent: "amber" },
];

export const aboutParagraphs = [
  "I'm a Computer Science & Design graduate from Tontadarya College of Engineering, currently building AI-based learning management systems at KAM Global AI. My work lives at the seam between research-grade ML and shippable software — production RAG pipelines, fine-tuned open-source LLMs, autonomous LangChain agents, and cross-platform Flutter applications.",
  "What I care about is end-to-end ownership. A 120ms retrieval latency is only useful if it survives production traffic. A fine-tuned LLaMA 3 is only useful if the inference pipeline stays under budget. I obsess over both halves: the model that reasons, and the system that serves it.",
  "Beyond AI, I'm drawn to distributed systems fundamentals — I once built a 5-node Raft key-value store from scratch with leader leases, log snapshotting, and crash recovery, just to understand consensus at the level of the wire protocol. That curiosity drives everything I ship.",
];

export const skillGroups = [
  {
    id: "ai-ml",
    label: "AI / ML",
    color: "lime",
    items: [
      "TensorFlow",
      "Scikit-learn",
      "NLP",
      "Pandas",
      "NumPy",
      "Generative AI",
      "Prompt Engineering",
      "AI Integration",
    ],
  },
  {
    id: "llm-rag",
    label: "LLM & RAG",
    color: "cyan",
    items: [
      "LangChain",
      "RAG Pipelines",
      "LLaMA 3",
      "Mistral",
      "HuggingFace",
      "PEFT",
      "LoRA",
      "Fine-Tuning",
      "MCP",
      "Embeddings",
      "Vector Databases",
    ],
  },
  {
    id: "app-dev",
    label: "Application Dev",
    color: "magenta",
    items: [
      "Flutter",
      "Cross-Platform",
      "Mobile Apps",
      "Web Development",
      "REST APIs",
      "Android Studio",
    ],
  },
  {
    id: "languages",
    label: "Languages",
    color: "amber",
    items: ["Python", "Java", "C", "C++", "JavaScript", "PHP", "SQL"],
  },
  {
    id: "infra",
    label: "Data & Cloud",
    color: "violet",
    items: ["Firebase", "Firestore", "MongoDB", "XAMPP", "Docker", "ZeroMQ"],
  },
  {
    id: "tools",
    label: "Tools & Craft",
    color: "lime",
    items: [
      "Git",
      "GitHub",
      "VS Code",
      "Postman",
      "Jupyter",
      "Colab",
      "Figma",
      "UI/UX Basics",
    ],
  },
];

export const experience = [
  {
    company: "KAM Global AI",
    role: "AI Engineer",
    period: "Jan 2026 — Present",
    location: "Remote",
    summary:
      "AI-based LMS division — intelligent learning systems and cross-platform AI product development.",
    bullets: [
      "Developed and deployed a production RAG pipeline achieving 120ms average query latency using vector databases and domain-specific knowledge bases.",
      "Built 4 autonomous AI agents using LangChain with memory chains, prompt templates, and tool integrations for production LMS features.",
      "Developed cross-platform mobile and web applications with integrated AI capabilities using Flutter and REST APIs.",
      "Fine-tuned LLaMA 3 and Mistral using PEFT and LoRA for task-specific performance in LMS workflows.",
      "Designed AI-powered LMS modules including intelligent Q&A, content summarization, and adaptive learning flows.",
    ],
    stack: ["LangChain", "LLaMA 3", "Mistral", "PEFT", "LoRA", "Flutter", "RAG", "Vector DB"],
  },
  {
    company: "IIITB COMET Foundation",
    role: "Project Intern",
    period: "2026",
    location: "Bengaluru, Karnataka",
    summary:
      "5G/6G wireless systems research — selected via competitive process, stipend awarded.",
    bullets: [
      "Selected through a competitive process for an internship focused on 5G and 6G wireless communication systems research.",
      "Contributed to next-generation wireless systems research and development with stipend awarded.",
    ],
    stack: ["5G/6G", "Wireless Systems", "Research"],
  },
];

export const projects = [
  {
    title: "MCP-Powered AI Developer Assistant",
    tagline: "A local AI dev assistant that reads codebases and ships actions.",
    description:
      "Built using Anthropic's Model Context Protocol, the assistant connects to GitHub, the file system, and databases as MCP servers for unified tool access. A RAG pipeline lets it reason over entire codebases, create issues, query databases, and trigger autonomous actions.",
    stack: ["Python", "MCP", "LangChain", "RAG", "GitHub API", "Claude API"],
    accent: "lime",
    metrics: [
      { label: "MCP servers", value: "3+" },
      { label: "Agent type", value: "Multi-step" },
    ],
    year: "2025",
  },
  {
    title: "Fine-Tuned Domain LLMs",
    tagline: "LLaMA 3 + Mistral fine-tuned for medical & legal domains.",
    description:
      "Parameter-efficient LoRA training on custom instruction datasets for medical and legal domains. Built high-quality instruction data, evaluated on domain benchmarks, and shipped scalable RAG-augmented inference at reduced compute cost.",
    stack: ["Python", "HuggingFace", "PEFT", "LoRA", "LangChain", "LLaMA 3", "Mistral"],
    accent: "cyan",
    metrics: [
      { label: "Method", value: "PEFT / LoRA" },
      { label: "Domain", value: "Medical, Legal" },
    ],
    year: "2025",
  },
  {
    title: "AI Proctoring System",
    tagline: "Real-time live proctoring with gaze tracking & malpractice flags.",
    description:
      "Real-time AI proctoring system with live camera face detection, gaze tracking, and candidate presence verification. Multiple-face detection, browser tab-switch alerts, and suspicious-behaviour flagging via OpenCV and MediaPipe. Flutter frontend, Firebase backend for session logging and reporting.",
    stack: ["Python", "OpenCV", "MediaPipe", "Computer Vision", "Flutter", "Firebase"],
    accent: "magenta",
    metrics: [
      { label: "Tracking", value: "Face + Gaze" },
      { label: "Frontend", value: "Flutter" },
    ],
    year: "2024",
  },
  {
    title: "Raft Distributed Key-Value Store",
    tagline: "5-node Raft cluster with leader leases, snapshots, and failover.",
    description:
      "5-node Raft-based distributed key-value store with leader leases, log snapshotting, and crash recovery. Achieved under 150ms commit latency and 100% recovery success rate with automatic failover and real-time monitoring.",
    stack: ["Python", "ZeroMQ", "Docker", "Raft Consensus"],
    accent: "amber",
    metrics: [
      { label: "Commit latency", value: "<150ms" },
      { label: "Recovery", value: "100%" },
    ],
    year: "2024",
  },
];

export const achievements = [
  {
    title: "IIITB COMET Foundation Internship",
    description:
      "Selected competitively for the FWC Project Internship on 5G and 6G wireless systems research — stipend awarded.",
    accent: "cyan",
    badge: "5G / 6G",
  },
  {
    title: "National Hackathon — Healthcare ML",
    description:
      "Designed and delivered healthcare and insurance ML prediction models at a national hackathon, achieving 70–80% accuracy.",
    accent: "lime",
    badge: "Healthcare ML",
  },
];

export const education = {
  degree: "B.E. in Computer Science and Design",
  school: "Tontadarya College of Engineering, Gadag",
  period: "2022 — 2026",
  cgpa: "8.0 / 10.0",
};

export const navItems = [
  { id: "hero", label: "Home", index: "01" },
  { id: "about", label: "About", index: "02" },
  { id: "skills", label: "Skills", index: "03" },
  { id: "experience", label: "Work", index: "04" },
  { id: "projects", label: "Projects", index: "05" },
  { id: "contact", label: "Contact", index: "06" },
];

export type AccentColor = "lime" | "cyan" | "magenta" | "amber" | "violet";

export const accentHex: Record<AccentColor, string> = {
  lime: "#d4ff3a",
  cyan: "#3afff0",
  magenta: "#ff3a8c",
  amber: "#ffb13a",
  violet: "#b988ff",
};
