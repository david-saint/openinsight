import { OpenRouterService } from './openrouter-service';
import { getSettings } from '../lib/settings';
import { OpenRouterModel, AppError } from '../lib/types';
import { ModelManager } from '../lib/model-manager';

/**
 * Handles the "Explain" request by calling OpenRouterService.
 */
export async function handleExplain(text: string): Promise<any> {
  const settings = await getSettings();
  const { explainModel, explainSettings } = settings;

  return OpenRouterService.chatCompletion({
    model: explainModel,
    messages: [
      { role: 'system', content: explainSettings.system_prompt },
      { role: 'user', content: text },
    ],
    temperature: explainSettings.temperature,
    max_tokens: explainSettings.max_tokens,
  });
}

/**
 * Handles the "Fact-check" request by calling OpenRouterService.
 */
export async function handleFactCheck(payload: { 
  text: string; 
  context?: { 
    paragraph: string; 
    pageTitle: string; 
    pageDescription: string; 
  } 
}): Promise<any> {
  const settings = await getSettings();
  const { factCheckModel, factCheckSettings } = settings;

  // For now we still just pass the text, context will be used in Task 4
  return OpenRouterService.chatCompletion({
    model: factCheckModel,
    messages: [
      { role: 'system', content: factCheckSettings.system_prompt },
      { role: 'user', content: payload.text },
    ],
    temperature: factCheckSettings.temperature,
    max_tokens: factCheckSettings.max_tokens,
  });
}

/**
 * Verifies the API key by sending a minimal request to OpenRouter.
 */
export async function handleTestApiKey(apiKey: string): Promise<boolean> {
  return OpenRouterService.testKey(apiKey);
}

/**
 * Fetches available models from OpenRouter via ModelManager.
 */
export async function handleFetchModels(): Promise<OpenRouterModel[]> {
  try {
    return await ModelManager.getModels();
  } catch (error) {
    // We still need a way to map errors for ModelManager if it doesn't use OpenRouterService
    // But for now, we'll just throw a simple error if it's not already an AppError
    if ((error as AppError).type) throw error;
    throw {
      type: 'unknown',
      message: `Failed to fetch models: ${(error as any)?.message || 'Unexpected error'}`
    } as AppError;
  }
}
