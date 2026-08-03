const EMBED_URL = "https://integrate.api.nvidia.com/v1/embeddings";

/** Unit-normalise so cosine similarity reduces to a dot product. */
export function normalize(vector: number[]): number[] {
  let sum = 0;
  for (const value of vector) sum += value * value;
  const magnitude = Math.sqrt(sum) || 1;
  return vector.map((value) => value / magnitude);
}

export function dot(a: number[], b: number[]): number {
  let total = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) total += a[i] * b[i];
  return total;
}

/**
 * Embed a user question for the dense half of retrieval.
 *
 * `model` is threaded in from the index metadata rather than read from config:
 * querying with a different model than the one that built the index produces
 * vectors in an unrelated space and silently returns garbage neighbours.
 *
 * Returns null on any failure so retrieval degrades to lexical-only instead of
 * failing the chat request.
 */
export async function embedQuery(query: string, model: string): Promise<number[] | null> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(EMBED_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [query],
        // Retrieval-tuned models encode questions and passages asymmetrically.
        input_type: "query",
        truncate: "END",
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      console.warn(`RAG: query embedding failed (${response.status}), falling back to lexical.`);
      return null;
    }

    const payload = await response.json();
    const vector = payload?.data?.[0]?.embedding;
    return Array.isArray(vector) ? normalize(vector) : null;
  } catch (error) {
    console.warn("RAG: query embedding error, falling back to lexical.", error);
    return null;
  }
}
