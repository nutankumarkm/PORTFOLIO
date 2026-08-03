import { tokenizeFields, type TokenSet } from "./tokenize";
import type { RagChunk } from "./types";

const K1 = 1.2;
/**
 * Length normalisation, damped from the usual 0.75. Half this corpus is
 * ~200-character stub posts, and at 0.75 their brevity alone floated them above
 * substantive long-form posts that actually answered the question.
 */
const B = 0.5;

/**
 * Field weights, applied by repeating a field's tokens N times before scoring.
 * This is the cheap approximation of BM25F: a query term appearing in the post
 * title or tags is a stronger relevance signal than one buried in prose.
 */
const FIELD_WEIGHTS = {
  title: 3,
  tags: 3,
  heading: 2,
  description: 2,
  body: 1,
} as const;

/**
 * How much of the score survives when a document matches only a fraction of
 * the query's terms. Pure BM25 sums per-term scores, so one rare term can beat
 * three common ones - which on this corpus ranked a LoRA post top for "how do
 * you keep RAG latency low" purely on the word "low". Scaling by query
 * coverage restores the intuition that matching more of the question matters.
 */
const COVERAGE_FLOOR = 0.3;

interface ScoredDoc {
  tf: Map<string, number>;
  length: number;
}

export interface Bm25Result {
  scores: Float64Array;
  /** Distinct primary query terms each chunk matched. Drives the precision gate. */
  matched: Uint16Array;
  /** Distinct primary terms in the query, matched or not. */
  queryTerms: number;
}

export interface Bm25Index {
  score(query: TokenSet): Bm25Result;
  size: number;
}

function weightedTokens(chunk: RagChunk): string[] {
  const tokens: string[] = [];

  const push = (text: string | null, weight: number) => {
    if (!text) return;
    const { primary, expanded } = tokenizeFields(text);
    for (let i = 0; i < weight; i++) tokens.push(...primary);
    // Compound fragments are recall helpers only - never field-boosted.
    tokens.push(...expanded);
  };

  push(chunk.title, FIELD_WEIGHTS.title);
  push(chunk.tags.join(" "), FIELD_WEIGHTS.tags);
  push(chunk.heading, FIELD_WEIGHTS.heading);
  push(chunk.description, FIELD_WEIGHTS.description);
  push(chunk.text, FIELD_WEIGHTS.body);

  return tokens;
}

export function buildBm25(chunks: RagChunk[]): Bm25Index {
  const docs: ScoredDoc[] = [];
  const docFreq = new Map<string, number>();
  let totalLength = 0;

  for (const chunk of chunks) {
    const tokens = weightedTokens(chunk);
    const tf = new Map<string, number>();
    for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1);

    for (const term of tf.keys()) docFreq.set(term, (docFreq.get(term) ?? 0) + 1);

    docs.push({ tf, length: tokens.length });
    totalLength += tokens.length;
  }

  const count = docs.length;
  const avgLength = count > 0 ? totalLength / count : 0;

  // IDF depends only on the corpus, so precompute it once.
  const idf = new Map<string, number>();
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log(1 + (count - df + 0.5) / (df + 0.5)));
  }

  return {
    size: count,
    score(query: TokenSet): Bm25Result {
      const scores = new Float64Array(count);
      const matched = new Uint16Array(count);

      // Deduplicate so a term repeated in the query isn't counted twice.
      const primary = [...new Set(query.primary)];
      const expanded = [...new Set(query.expanded)].filter((t) => !primary.includes(t));
      const result: Bm25Result = { scores, matched, queryTerms: primary.length };

      if (avgLength === 0 || primary.length === 0) return result;

      const accumulate = (term: string, countsAsMatch: boolean) => {
        const termIdf = idf.get(term);
        if (termIdf === undefined) return;

        for (let i = 0; i < count; i++) {
          const tf = docs[i].tf.get(term);
          if (tf === undefined) continue;

          const norm = 1 - B + (B * docs[i].length) / avgLength;
          scores[i] += termIdf * ((tf * (K1 + 1)) / (tf + K1 * norm));
          if (countsAsMatch) matched[i] += 1;
        }
      };

      for (const term of primary) accumulate(term, true);
      // Compound fragments add score but don't count as concepts matched.
      for (const term of expanded) accumulate(term, false);

      // Coverage is measured against every primary term, including ones absent
      // from the corpus: a question mostly made of terms this blog never uses
      // is a question this blog probably can't answer.
      for (let i = 0; i < count; i++) {
        if (scores[i] === 0) continue;
        const coverage = matched[i] / primary.length;
        scores[i] *= COVERAGE_FLOOR + (1 - COVERAGE_FLOOR) * coverage;
      }

      return result;
    },
  };
}
