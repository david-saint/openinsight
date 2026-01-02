import { OpenRouterService } from './openrouter-service.js';
import { getSettings } from '../lib/settings.js';
import type { OpenRouterModel, AppError } from '../lib/types.js';
import { ModelManager } from '../lib/model-manager.js';
import { PromptManager } from '../lib/prompt-manager.js';

/**
 * Handles the "Explain" request by calling OpenRouterService.
 */
export async function handleExplain(text: string): Promise<any> {
  const settings = await getSettings();
  const { explainModel, explainSettings, stylePreference } = settings;

  return OpenRouterService.chatCompletion({
    model: explainModel,
    messages: [
      { role: 'system', content: PromptManager.getExplainPrompt(stylePreference) },
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
  const { factCheckModel, factCheckSettings, stylePreference } = settings;

  return OpenRouterService.chatCompletion({
    model: factCheckModel,
    messages: [
      { role: 'system', content: PromptManager.getFactCheckPrompt(stylePreference) },
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
