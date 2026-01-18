/**
 * Cloudflare Workers AI REST API client
 * Uses REST API calls instead of bindings for local development
 */

interface CloudflareAIConfig {
  accountId: string;
  apiToken: string;
}

interface TextClassificationInput {
  text: string;
}

interface ChatInput {
  messages: Array<{ role: string; content: string }>;
}

/**
 * Call Cloudflare Workers AI REST API for text classification models
 */
export async function callCloudflareAIClassification(
  model: string,
  input: TextClassificationInput,
  config: CloudflareAIConfig
): Promise<any> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run/${model}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare AI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  // Cloudflare API returns { result: {...} } wrapper
  return result.result || result;
}

/**
 * Call Cloudflare Workers AI REST API for chat/LLM models
 */
export async function callCloudflareAIChat(
  model: string,
  input: ChatInput,
  config: CloudflareAIConfig
): Promise<any> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run/${model}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare AI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  // Cloudflare API returns { result: {...} } wrapper
  // For chat models, extract the response text
  const apiResult = result.result || result;
  
  // Handle different response formats
  if (apiResult.response) {
    return { content: apiResult.response };
  } else if (typeof apiResult === 'string') {
    return { content: apiResult };
  } else if (apiResult.choices && apiResult.choices[0]) {
    return { content: apiResult.choices[0].message?.content || apiResult.choices[0].text || '' };
  }
  
  return { content: JSON.stringify(apiResult) };
}

/**
 * Get Cloudflare AI config from environment
 */
export function getCloudflareAIConfig(env: { CLOUDFLARE_ACCOUNT_ID?: string; CLOUDFLARE_API_TOKEN?: string }): CloudflareAIConfig {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      'Cloudflare AI credentials missing. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables.\n' +
      'See CLOUDFLARE_SETUP.md for instructions.'
    );
  }

  return { accountId, apiToken };
}
