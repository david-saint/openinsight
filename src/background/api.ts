import { getApiKey } from '../lib/settings';

/**
 * Enhanced fetch that automatically attaches the OpenRouter API key.
 */
export async function fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('API key not found. Please set it in the extension options.');
  }

  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  headers.set('Content-Type', 'application/json');
  // OpenRouter recommends setting this
  headers.set('HTTP-Referer', 'https://github.com/openinsight/openinsight');
  headers.set('X-Title', 'OpenInsight');

  return fetch(url, {
    ...init,
    headers,
  });
}
