import rawIndex from "@/generated/blog-index.json";
import { buildBm25 } from "./bm25";
import { dot, embedQuery } from "./embed";
import { tokenizeFields } from "./tokenize";
import type { RagIndex, RetrievedChunk } from "./types";

const index = rawIndex as unknown as RagIndex;

// 71 chunks - building the index at module scope costs a few milliseconds once
// per cold start, and brute-force scoring beats any ANN structure at this size.
const bm25 = buildBm25(index.items);

/** Reciprocal Rank Fusion constant. 60 is the value from the original paper. */
const RRF_K = 60;

/**
 * Relevance floor. Chat questions are often conversational ("hi", "who are
 * you") and retrieving blog chunks for those injects pure noise, so weak
 * matches are dropped entirely rather than padded to k.
 */
const MIN_LEXICAL_SCORE = 2.5;
const MIN_DENSE_SIMILARITY = 0.55;

/**
 * A chunk must match at least this many distinct query concepts. One generic
 * word in common is not topical overlap - it is how "what is your email
 * address" ends up retrieving a 5G research post on the word "address".
 * Relaxed for single-concept queries, which have nothing else to match.
 */
const MIN_MATCHED_TERMS = 2;

/** How deep each ranking goes before fusion. */
const CANDIDATE_DEPTH = 24;

export interface RetrieveOptions {
  k?: number;
  minLexicalScore?: number;
}

function rankOf(scores: Float64Array, depth: number): Map<number, number> {
  const order = Array.from(scores.keys())
    .filter((i) => scores[i] > 0)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, depth);

  const ranks = new Map<number, number>();
  order.forEach((docIndex, rank) => ranks.set(docIndex, rank + 1));
  return ranks;
}

export async function retrieve(
  query: string,
  { k = 4, minLexicalScore = MIN_LEXICAL_SCORE }: RetrieveOptions = {}
): Promise<RetrievedChunk[]> {
  if (index.items.length === 0) return [];

  const queryTokens = tokenizeFields(query);
  if (queryTokens.primary.length === 0) return [];

  const { scores: lexicalScores, matched, queryTerms } = bm25.score(queryTokens);
  const lexicalRanks = rankOf(lexicalScores, CANDIDATE_DEPTH);
  const requiredMatches = Math.min(MIN_MATCHED_TERMS, queryTerms);

  // Dense half, only when the index was built with vectors AND the query can
  // be embedded with the same model. Any failure leaves this empty.
  const denseSimilarities = new Float64Array(index.items.length);
  let denseRanks = new Map<number, number>();

  if (index.embedded && index.embedModel) {
    const queryVector = await embedQuery(query, index.embedModel);
    if (queryVector) {
      index.items.forEach((chunk, i) => {
        denseSimilarities[i] = chunk.vector ? dot(queryVector, chunk.vector) : 0;
      });
      denseRanks = rankOf(denseSimilarities, CANDIDATE_DEPTH);
    }
  }

  const candidates = new Set<number>([...lexicalRanks.keys(), ...denseRanks.keys()]);
  const fused: RetrievedChunk[] = [];

  for (const i of candidates) {
    const lexicalRank = lexicalRanks.get(i) ?? null;
    const denseRank = denseRanks.get(i) ?? null;

    // A chunk earns its place on either signal, but must clear that signal's
    // floor - otherwise a merely least-bad match still reaches the prompt.
    const lexicallyRelevant =
      lexicalScores[i] >= minLexicalScore && matched[i] >= requiredMatches;
    const denselyRelevant = denseSimilarities[i] >= MIN_DENSE_SIMILARITY;
    if (!lexicallyRelevant && !denselyRelevant) continue;

    let score = 0;
    if (lexicalRank !== null) score += 1 / (RRF_K + lexicalRank);
    if (denseRank !== null) score += 1 / (RRF_K + denseRank);

    fused.push({
      chunk: index.items[i],
      score,
      lexicalScore: lexicalScores[i],
      lexicalRank,
      denseRank,
    });
  }

  return fused
    .sort((a, b) => b.score - a.score || b.lexicalScore - a.lexicalScore)
    .slice(0, k);
}

/**
 * Render retrieved chunks for the prompt. Each gets a stable [n] marker and its
 * URL so the model can cite specific posts rather than paraphrase anonymously.
 */
export function formatRetrievedContext(results: RetrievedChunk[]): string {
  return results
    .map(({ chunk }, i) => {
      const heading = chunk.heading ? ` > ${chunk.heading}` : "";
      return `[${i + 1}] "${chunk.title}"${heading} (${chunk.url})\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
}

export const ragIndexMeta = {
  posts: index.posts,
  chunks: index.chunks,
  embedded: index.embedded,
  embedModel: index.embedModel,
  generatedAt: index.generatedAt,
};
