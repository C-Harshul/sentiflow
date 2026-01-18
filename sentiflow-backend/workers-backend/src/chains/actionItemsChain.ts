import type { Env } from '../types/env';
import type { Feedback, ActionItem } from '../types/feedback';
import { getActionItemsPrompt } from '../utils/prompts';

export async function extractActionItems(
  feedbackList: Feedback[],
  env: Env
): Promise<ActionItem[]> {
  const systemPrompt = getActionItemsPrompt();
  const feedbackText = feedbackList
    .map((f) => `[${f.id}] ${f.content}`)
    .join('\n');
  const userPrompt = `Extract action items from the following feedback:\n${feedbackText}`;

  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = typeof response === 'string' 
    ? response 
    : (response as any)?.response || JSON.stringify(response);

  // Parse action items from response
  // This is a placeholder - you'll need to implement proper parsing
  const actionItems: ActionItem[] = [];

  // TODO: Implement proper JSON parsing from LLM response
  // Expected format: array of { id, description, priority, relatedFeedbackIds, category }
  
  return actionItems;
}
