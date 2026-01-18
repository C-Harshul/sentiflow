import type { Env } from '../types/env';
import type { Feedback, Summary, SentimentAnalysis } from '../types/feedback';
import { getSummaryPrompt } from '../utils/prompts';

export async function generateSummary(
  feedbackList: Feedback[],
  env: Env
): Promise<Summary> {
  const systemPrompt = getSummaryPrompt();
  const feedbackText = feedbackList
    .map((f) => `- ${f.content}`)
    .join('\n');
  const userPrompt = `Summarize the following feedback:\n${feedbackText}`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = typeof response === 'string' 
    ? response 
    : (response as any)?.response || JSON.stringify(response);

  // Parse summary response
  // This is a placeholder - you'll need to implement proper parsing
  const summaryMatch = content.match(/summary[:\s]+(.+?)(?:\n|$)/i);
  const keyPointsMatch = content.match(/key points?[:\s]+(.+?)(?:\n|$)/i);

  return {
    summary: summaryMatch?.[1] || content,
    keyPoints: keyPointsMatch?.[1]?.split(/[,\n]/).map(s => s.trim()) || [],
    sentiment: {
      sentiment: 'neutral',
      score: 0,
      confidence: 0.5,
    },
  };
}
