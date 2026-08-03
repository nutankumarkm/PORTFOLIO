export interface RagChunk {
  id: string;
  slug: string;
  url: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  heading: string | null;
  text: string;
  /** Present only when the index was built with RAG_EMBEDDINGS=1. Unit-normalised. */
  vector: number[] | null;
}

export interface RagIndex {
  generatedAt: string;
  posts: number;
  chunks: number;
  embedded: boolean;
  embedModel: string | null;
  dimensions: number;
  items: RagChunk[];
}

export interface RetrievedChunk {
  chunk: RagChunk;
  /** Fused ranking score. Only meaningful relative to others in the same result set. */
  score: number;
  /** Raw BM25 score, used for the relevance gate. */
  lexicalScore: number;
  lexicalRank: number | null;
  denseRank: number | null;
}
