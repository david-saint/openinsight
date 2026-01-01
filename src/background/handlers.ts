import { fetchWithAuth } from './api';
import { getSettings } from '../lib/settings';
import { OpenRouterChatResponse, OpenRouterModel } from '../lib/types';
import { ModelManager } from '../lib/model-manager';

/**
 * Handles the "Explain" request by calling OpenRouter.
 */
export async function handleExplain(text: string): Promise<string> {
  const settings = await getSettings();
  const { explainModel, explainSettings } = settings;

  const response = await fetchWithAuth('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: explainModel,
      messages: [
        { role: 'system', content: explainSettings.system_prompt },
        { role: 'user', content: text },
      ],
      temperature: explainSettings.temperature,
      max_tokens: explainSettings.max_tokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to explain: ${response.statusText || errorText}`);
  }

  const data = await response.json() as OpenRouterChatResponse;
  return data.choices[0].message.content;
}

/**
 * Handles the "Fact-check" request by calling OpenRouter.
 */
export async function handleFactCheck(text: string): Promise<string> {
  const settings = await getSettings();
  const { factCheckModel, factCheckSettings } = settings;

  const response = await fetchWithAuth('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: factCheckModel,
      messages: [
        { role: 'system', content: factCheckSettings.system_prompt },
        { role: 'user', content: text },
      ],
      temperature: factCheckSettings.temperature,
      max_tokens: factCheckSettings.max_tokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fact-check: ${response.statusText || errorText}`);
  }

  const data = await response.json() as OpenRouterChatResponse;
  return data.choices[0].message.content;
}

/**
 * Verifies the API key by sending a minimal request to OpenRouter.
 * Note: If apiKey is provided, it should be used for this specific request.
 */
export async function handleTestApiKey(apiKey?: string): Promise<boolean> {
  // If a specific key is provided for testing, we use it.
  
  const response = await fetchWithAuth('https://openrouter.ai/api/v1/auth/key', {
    method: 'GET',
  }, apiKey);

  if (!response.ok) {
    throw new Error(`API Key verification failed: ${response.statusText}`);
  }

  return true;
}

/**
 * Fetches available models from OpenRouter via ModelManager.
 */
export async function handleFetchModels(): Promise<OpenRouterModel[]> {
  return ModelManager.getModels();
}