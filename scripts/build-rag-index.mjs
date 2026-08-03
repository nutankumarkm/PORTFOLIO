#!/usr/bin/env node
/**
 * Build-time RAG indexer.
 *
 * Emits src/generated/blog-index.json, which the chat route imports so the
 * corpus is bundled rather than read from disk.
 *
 * Next's output tracing does copy src/content/blog into .next/standalone, so
 * reading the markdown at runtime would also work. Precomputing is still the
 * better trade here: no per-request disk I/O or markdown parsing, the index is
 * identical in dev and prod, and it is the only place embeddings can be
 * computed once instead of on every cold start.
 *
 * Embeddings are optional. With NVIDIA_API_KEY set and RAG_EMBEDDINGS=1 this
 * also writes a dense vector per chunk, which flips retrieval from lexical-only
 * to hybrid at query time. Without them the index is still fully usable.
 *
 *   node scripts/build-rag-index.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const OUT_DIR = path.join(ROOT, "src", "generated");
const OUT_FILE = path.join(OUT_DIR, "blog-index.json");

/** Target ceiling for a chunk. Oversized sections get split on paragraphs. */
const MAX_CHUNK_CHARS = 1400;
/** Chunks smaller than this get folded into their neighbour instead of standing alone. */
const MIN_CHUNK_CHARS = 160;
/** Paragraphs of overlap carried into the next chunk so ideas don't get cut mid-thought. */
const OVERLAP_PARAGRAPHS = 1;

const EMBED_URL = "https://integrate.api.nvidia.com/v1/embeddings";
const EMBED_MODEL = process.env.RAG_EMBED_MODEL || "nvidia/nv-embedqa-e5-v5";
const EMBED_BATCH = 32;

// ---------------------------------------------------------------------------
// Markdown parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    if (!key) continue;
    meta[key] = line.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: raw.slice(match[0].length) };
}

function parseTags(value) {
  if (!value) return [];
  return value
    .replace(/[[\]]/g, "")
    .split(",")
    .map((t) => t.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/**
 * Annotate each line with whether it sits inside a fenced code block, so
 * headings, horizontal rules and blank lines inside code are left alone.
 */
function markFences(body) {
  let inFence = false;
  return body.split(/\r?\n/).map((line) => {
    const isFenceDelimiter = /^\s*(```|~~~)/.test(line);
    // A delimiter line belongs to the fence it opens or closes.
    const fenced = inFence || isFenceDelimiter;
    if (isFenceDelimiter) inFence = !inFence;
    return { line, fenced };
  });
}

/** Split a post body into `## `-delimited sections, fence-aware. */
function splitSections(body) {
  const sections = [];
  let current = { heading: null, lines: [] };

  for (const { line, fenced } of markFences(body)) {
    const heading = !fenced && /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      sections.push(current);
      current = { heading: heading[1].replace(/^#+\s*/, "").trim(), lines: [] };
      continue;
    }
    // Drop `---` rules used as visual separators; they carry no meaning.
    if (!fenced && /^\s*-{3,}\s*$/.test(line)) continue;
    current.lines.push(line);
  }
  sections.push(current);

  return sections
    .map((s) => ({ heading: s.heading, text: s.lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() }))
    .filter((s) => s.text.length > 0);
}

/** Split text into paragraph blocks, keeping fenced code blocks whole. */
function splitParagraphs(text) {
  const blocks = [];
  let buffer = [];

  const flush = () => {
    const joined = buffer.join("\n").trim();
    if (joined) blocks.push(joined);
    buffer = [];
  };

  for (const { line, fenced } of markFences(text)) {
    if (!fenced && line.trim() === "") flush();
    else buffer.push(line);
  }
  flush();
  return blocks;
}

/** Pack paragraphs into <= MAX_CHUNK_CHARS windows with a paragraph of overlap. */
function packParagraphs(paragraphs) {
  const packed = [];
  let window = [];
  let size = 0;

  for (const paragraph of paragraphs) {
    // +2 for the blank line that will rejoin them.
    if (window.length > 0 && size + paragraph.length + 2 > MAX_CHUNK_CHARS) {
      packed.push(window.join("\n\n"));
      window = window.slice(-OVERLAP_PARAGRAPHS);
      size = window.reduce((n, p) => n + p.length + 2, 0);
    }
    window.push(paragraph);
    size += paragraph.length + 2;
  }
  if (window.length > 0) packed.push(window.join("\n\n"));

  return packed;
}

/**
 * Chunk one post. Short posts stay whole; long ones split by heading, then by
 * paragraph. Undersized trailing chunks are merged back so we never index a
 * two-line fragment as a standalone result.
 */
function chunkPost(body) {
  const chunks = [];

  for (const section of splitSections(body)) {
    const pieces =
      section.text.length <= MAX_CHUNK_CHARS
        ? [section.text]
        : packParagraphs(splitParagraphs(section.text));

    for (const text of pieces) {
      const previous = chunks[chunks.length - 1];
      if (
        previous &&
        previous.heading === section.heading &&
        text.length < MIN_CHUNK_CHARS
      ) {
        previous.text = `${previous.text}\n\n${text}`;
        continue;
      }
      chunks.push({ heading: section.heading, text });
    }
  }

  // A whole post shorter than the minimum still deserves one chunk.
  if (chunks.length > 1) {
    const merged = [];
    for (const chunk of chunks) {
      const previous = merged[merged.length - 1];
      if (previous && chunk.text.length < MIN_CHUNK_CHARS) {
        previous.text = `${previous.text}\n\n${chunk.text}`;
        continue;
      }
      merged.push(chunk);
    }
    return merged;
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Optional dense vectors
// ---------------------------------------------------------------------------

/**
 * The text actually handed to the embedding model. Titles and headings are
 * prepended so an isolated chunk still carries the topic it belongs to.
 */
export function embeddingText(chunk) {
  return [chunk.title, chunk.heading, chunk.text].filter(Boolean).join("\n");
}

async function embedBatch(texts, apiKey) {
  const response = await fetch(EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      // Retrieval-tuned embedding models encode passages and queries
      // differently; the query side must use input_type "query".
      input_type: "passage",
      truncate: "END",
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    throw new Error(`embeddings ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  const sorted = [...payload.data].sort((a, b) => a.index - b.index);
  return sorted.map((row) => row.embedding);
}

async function addEmbeddings(chunks, apiKey) {
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    const vectors = await embedBatch(batch.map(embeddingText), apiKey);
    batch.forEach((chunk, j) => {
      chunk.vector = normalize(vectors[j]);
    });
    process.stdout.write(`  embedded ${Math.min(i + EMBED_BATCH, chunks.length)}/${chunks.length}\r`);
  }
  process.stdout.write("\n");
}

/** Unit-normalise so cosine similarity reduces to a dot product at query time. */
function normalize(vector) {
  let sum = 0;
  for (const value of vector) sum += value * value;
  const magnitude = Math.sqrt(sum) || 1;
  return vector.map((value) => value / magnitude);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    throw new Error(`blog directory not found: ${BLOG_DIR}`);
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md")).sort();
  const chunks = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);

    const title = meta.title || slug;
    const tags = parseTags(meta.tags);

    chunkPost(body).forEach((chunk, i) => {
      chunks.push({
        id: `${slug}#${i}`,
        slug,
        url: `/blog/${slug}`,
        title,
        date: meta.date || "",
        description: meta.description || "",
        tags,
        heading: chunk.heading,
        text: chunk.text,
        vector: null,
      });
    });
  }

  const wantEmbeddings = process.env.RAG_EMBEDDINGS === "1";
  const apiKey = process.env.NVIDIA_API_KEY;
  let embedded = false;

  if (wantEmbeddings && apiKey) {
    console.log(`Embedding ${chunks.length} chunks with ${EMBED_MODEL}...`);
    await addEmbeddings(chunks, apiKey);
    embedded = true;
  } else if (wantEmbeddings) {
    console.warn("RAG_EMBEDDINGS=1 but NVIDIA_API_KEY is empty - writing lexical-only index.");
  }

  const index = {
    generatedAt: new Date().toISOString(),
    posts: files.length,
    chunks: chunks.length,
    embedded,
    embedModel: embedded ? EMBED_MODEL : null,
    dimensions: embedded ? chunks[0]?.vector?.length ?? 0 : 0,
    items: chunks,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(index), "utf8");

  const sizeKb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(
    `RAG index: ${chunks.length} chunks from ${files.length} posts -> ${path.relative(ROOT, OUT_FILE)} (${sizeKb} KB, ${embedded ? "hybrid" : "lexical-only"})`
  );
}

main().catch((error) => {
  console.error("Failed to build RAG index:", error);
  process.exit(1);
});
