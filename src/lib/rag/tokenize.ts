/**
 * Shared tokenizer for the lexical half of retrieval.
 *
 * Indexing and querying MUST go through this one module - a tokenizer that
 * drifts between the two sides silently destroys recall, which is the single
 * most common way a working BM25 index turns into a broken one.
 */

const STOPWORDS = new Set([
  // Standard function words.
  "a", "about", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can",
  "did", "do", "does", "for", "from", "had", "has", "have", "how", "i", "if",
  "in", "into", "is", "it", "its", "me", "of", "on", "or", "our", "so",
  "than", "that", "the", "their", "them", "then", "there", "these", "they",
  "this", "to", "was", "were", "what", "when", "where", "which", "who", "why",
  "will", "with", "would", "you", "your",
  // Generic verbs and fillers that dominate conversational phrasing without
  // carrying topic signal. Without these, "how do you keep RAG latency low"
  // matches a PHP stub on the words "keep" and "low".
  "all", "also", "any", "best", "better", "get", "give", "good", "just", "keep",
  "know", "like", "make", "many", "more", "most", "much", "need", "really",
  "should", "show", "some", "take", "tell", "thing", "think", "use", "using",
  "want", "way", "well", "work", "works",
]);

export interface TokenSet {
  /** Whole terms as written. These carry the field weighting. */
  primary: string[];
  /**
   * Fragments of compound terms ("next.js" -> "next", "js"). Kept separate
   * because they are recall helpers, not evidence of topicality: boosting
   * "low" out of a "Low-Rank" title 3x makes an unrelated post win a query
   * that merely contains the word "low".
   */
  expanded: string[];
}

/**
 * Fold regular plurals so "embeddings" and "embedding" collide.
 *
 * Ordering matters: the -es rules must run before the bare -s rule, otherwise
 * "indexes" stems to "indexe" while "index" stays "index" and they stop
 * matching each other.
 */
function stem(term: string): string {
  if (term.length > 4 && term.endsWith("ies")) return `${term.slice(0, -3)}y`;
  if (term.length > 4 && /(?:ss|x|ch|sh|z|s)es$/.test(term)) return term.slice(0, -2);
  if (term.length > 3 && term.endsWith("s") && !term.endsWith("ss")) return term.slice(0, -1);
  return term;
}

/**
 * Only split compounds that look like identifiers, versions or model names.
 *
 * Splitting every hyphenated word poisons the index with its parts: "Low-Rank"
 * contributes "low", which then wins any query containing the word "low".
 * Identifiers ("next.js", "nv-embedqa-e5-v5", "sub-150ms") are worth splitting
 * because users type their fragments; ordinary English compounds
 * ("cross-platform", "fine-tune", "low-rank") are not.
 */
function isIdentifierLike(term: string): boolean {
  if (/[._]/.test(term)) return true;
  if (/\d/.test(term)) return true;
  return term.split("-").length > 2;
}

/** Lowercase, split on non-word characters, stem, and drop stopwords. */
export function tokenizeFields(input: string): TokenSet {
  const primary: string[] = [];
  const expanded: string[] = [];
  const matches = input.toLowerCase().match(/[a-z0-9][a-z0-9+#._-]*/g) ?? [];

  for (const match of matches) {
    // Trim trailing separators left by prose punctuation ("chunking," -> "chunking").
    const term = match.replace(/[._-]+$/, "");
    if (!term) continue;

    const stemmed = stem(term);
    if (stemmed && !STOPWORDS.has(stemmed)) primary.push(stemmed);

    if (/[._-]/.test(term) && isIdentifierLike(term)) {
      // Reach "nv-embedqa" by "nvembedqa" as well as by "embedqa".
      const glued = stem(term.replace(/[._-]+/g, ""));
      if (glued.length > 1 && glued !== stemmed && !STOPWORDS.has(glued)) expanded.push(glued);

      for (const part of term.split(/[._-]+/)) {
        const piece = stem(part);
        if (piece.length > 1 && !STOPWORDS.has(piece)) expanded.push(piece);
      }
    }
  }

  return { primary, expanded };
}

/** Flat token list. Used for queries, where no field weighting applies. */
export function tokenize(input: string): string[] {
  const { primary, expanded } = tokenizeFields(input);
  return [...primary, ...expanded];
}
