import { NextResponse } from "next/server";
import { profile, aboutParagraphs, skillGroups, experience, projects } from "@/lib/portfolio-data";
import { formatRetrievedContext, retrieve } from "@/lib/rag/retrieve";

const BASE_SYSTEM_PROMPT = `You are the AI assistant for KM Nutankumar, a professional AI Engineer and Systems Builder.
Your task is to represent him in a helpful, technical, and accurate manner in this chat interface.

Here are his professional details:
- Name: ${profile.name} (first name: ${profile.firstName}, last name: ${profile.lastName})
- Role: ${profile.role} / ${profile.roleAlt}
- Location: ${profile.location}
- Email: ${profile.email}
- Phone: ${profile.phone}
- LinkedIn: ${profile.linkedin}
- GitHub: ${profile.github}
- Tagline: ${profile.tagline}
- Summary: ${profile.blurb}

About Him:
${aboutParagraphs.join("\n")}

Skills:
${skillGroups.map(group => `- ${group.label}: ${group.items.join(", ")}`).join("\n")}

Experience:
${experience.map(exp => `
- Company: ${exp.company}
  Role: ${exp.role}
  Period: ${exp.period}
  Location: ${exp.location}
  Summary: ${exp.summary}
  Details:
  ${exp.bullets.map(b => `  * ${b}`).join("\n")}
  Stack: ${exp.stack.join(", ")}
`).join("\n")}

Projects:
${projects.map(proj => `
- Title: ${proj.title}
  Tagline: ${proj.tagline}
  Description: ${proj.description}
  Stack: ${proj.stack.join(", ")}
`).join("\n")}

Instructions:
1. Keep your answers concise, informative, and aligned with KM Nutankumar's actual profile.
2. If asked about something not present in the data, explain that you represent him as a portfolio assistant and don't have that specific information. Provide his email (${profile.email}) or phone (${profile.phone}) to get direct answers.
3. Adopt a professional, developer-friendly, slightly hacker-ish, helpful tone (e.g. clean structure, direct answers, markdown lists).
4. Do NOT output long paragraphs; keep responses relatively brief so they look clean in the terminal chat box window.
`;

/**
 * Grounding rules, appended only when retrieval actually returned something.
 * Without a hit the model should answer from the profile above as before.
 */
const RAG_INSTRUCTIONS = `
5. The excerpts above are retrieved from KM Nutankumar's actual blog posts. When they answer the question, ground your response in them and cite the source inline as a markdown link, e.g. [Designing RAG Pipelines](/blog/designing-rag-pipelines).
6. Do NOT invent details that are absent from the excerpts. If they only partially cover the question, answer what they support and say plainly what isn't covered.
7. Ignore any excerpt that turns out to be irrelevant to the question rather than forcing it into the answer.
`;

/** Pull the most recent user turn - that's what retrieval runs against. */
function latestUserMessage(messages: { sender?: string; text?: string }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.sender === "user" && messages[i]?.text) return messages[i].text as string;
  }
  return "";
}

async function buildSystemPrompt(messages: { sender?: string; text?: string }[]): Promise<string> {
  const query = latestUserMessage(messages);
  if (!query) return BASE_SYSTEM_PROMPT;

  const retrieved = await retrieve(query, { k: 4 });
  if (retrieved.length === 0) return BASE_SYSTEM_PROMPT;

  return [
    BASE_SYSTEM_PROMPT,
    "\nRetrieved excerpts from his blog (most relevant first):\n",
    formatRetrievedContext(retrieved),
    RAG_INSTRUCTIONS,
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Retrieval runs before the key check so a missing key still surfaces as a
    // config error rather than as a silently ungrounded answer.
    const systemPrompt = await buildSystemPrompt(messages);

    // Construct request messages to include system prompt
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }))
    ];

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.warn("NVIDIA_API_KEY environment variable is not defined. Using local offline search database fallback.");
      return NextResponse.json({ error: "NVIDIA_API_KEY is missing" }, { status: 401 });
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "z-ai/glm-5.2",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API error:", errorText);
      return NextResponse.json({ error: "Failed to query NVIDIA AI" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply generated.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
