import { fetchWithAuth } from './api';
import { getSettings } from '../lib/settings';
import { OpenRouterChatResponse, OpenRouterModel, AppError, ErrorType } from '../lib/types';
import { ModelManager } from '../lib/model-manager';

/**
 * Maps HTTP responses and exceptions to typed AppErrors.
 */
async function mapError(responseOrError: any, context: string): Promise<AppError> {
  // Use duck-typing for Response check because vitest's instanceof can fail for global Response
  if (responseOrError && typeof responseOrError.status === 'number' && typeof responseOrError.text === 'function') {
    const status = responseOrError.status;
    const statusText = responseOrError.statusText;
    let errorText = '';
    try {
      errorText = await responseOrError.text();
    } catch (e) {
      // Ignore text parse errors
    }

    let type: ErrorType = 'unknown';
    if (status === 401) type = 'auth';
    else if (status === 429) type = 'rate_limit';
    else if (status >= 400 && status < 500) type = 'llm';
    else if (status >= 500) type = 'llm'; // Treat server errors as LLM errors for now

    return {
      type,
      message: `${context}: ${statusText || errorText || 'Unknown error'} (${status})`,
      code: status.toString()
    };
  }

  // Handle exceptions (like network errors)
  const isNetworkError = responseOrError instanceof TypeError || responseOrError?.message?.includes('network');
  return {
    type: isNetworkError ? 'network' : 'unknown',
    message: `${context}: ${responseOrError?.message || 'Unexpected error'}`,
  };
}

/**
 * Handles the "Explain" request by calling OpenRouter.
 */
export async function handleExplain(text: string): Promise<string> {
  try {
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
      throw await mapError(response, 'Failed to explain');
    }

    const data = await response.json() as OpenRouterChatResponse;
    return data.choices[0].message.content;
  } catch (error) {
    if ((error as AppError).type) throw error;
    throw await mapError(error, 'Failed to explain');
  }
}

/**
 * Handles the "Fact-check" request by calling OpenRouter.
 */
export async function handleFactCheck(text: string): Promise<string> {
  try {
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
      throw await mapError(response, 'Failed to fact-check');
    }

    const data = await response.json() as OpenRouterChatResponse;
    return data.choices[0].message.content;
  } catch (error) {
    if ((error as AppError).type) throw error;
    throw await mapError(error, 'Failed to fact-check');
  }
}

/**
 * Verifies the API key by sending a minimal request to OpenRouter.
 */
export async function handleTestApiKey(apiKey?: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
    }, apiKey);

    if (!response.ok) {
      throw await mapError(response, 'API Key verification failed');
    }

    return true;
  } catch (error) {
    if ((error as AppError).type) throw error;
    throw await mapError(error, 'API Key verification failed');
  }
}

/**
 * Fetches available models from OpenRouter via ModelManager.
 */
export async function handleFetchModels(): Promise<OpenRouterModel[]> {
  try {
    return await ModelManager.getModels();
  } catch (error) {
    throw await mapError(error, 'Failed to fetch models');
  }
}
