import type { Env } from '../types/env';
import type { Feedback } from '../types/feedback';

/**
 * Generate embeddings for feedback content using Cloudflare Workers AI
 */
export async function generateEmbedding(
  text: string,
  env: Env
): Promise<number[]> {
  // Use Cloudflare Workers AI for embeddings
  // Note: This is a placeholder - actual implementation depends on available models
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [text],
  });

  // Extract embedding vector from response
  // The actual structure depends on the model output
  if (response && Array.isArray(response.data)) {
    return response.data[0] as number[];
  }

  // Fallback: return empty array if embedding fails
  return [];
}

/**
 * Generate embeddings for multiple feedback items
 */
export async function generateEmbeddings(
  feedbackList: Feedback[],
  env: Env
): Promise<Map<string, number[]>> {
  const embeddings = new Map<string, number[]>();

  for (const feedback of feedbackList) {
    const embedding = await generateEmbedding(feedback.content, env);
    embeddings.set(feedback.id, embedding);
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
