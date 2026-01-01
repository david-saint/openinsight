import { 
  BackendMessage, 
  BackendResponse, 
  OpenRouterModel, 
  AppError 
} from './types';

/**
 * Client class to interact with the background service worker.
 * Provides a clean, typed abstraction for all backend actions.
 */
export class BackendClient {
  /**
   * Internal helper to send messages to the background script.
   */
  private static send<T>(message: BackendMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response: BackendResponse<T>) => {
        // Handle runtime errors (e.g. extension context invalidated)
        if (chrome.runtime.lastError) {
          return reject({
            type: 'unknown',
            message: chrome.runtime.lastError.message || 'Extension runtime error'
          } as AppError);
        }

        if (response.success) {
          resolve(response.result as T);
        } else {
          reject(response.error);
        }
      });
    });
  }

  /**
   * Requests an explanation for the provided text.
   */
  static async explain(text: string): Promise<string> {
    return BackendClient.send<string>({
      type: 'BACKEND_EXPLAIN',
      payload: { text }
    });
  }

  /**
   * Requests a fact-check for the provided text.
   */
  static async factCheck(text: string): Promise<string> {
    return BackendClient.send<string>({
      type: 'BACKEND_FACT_CHECK',
      payload: { text }
    });
  }

  /**
   * Fetches the list of available models from OpenRouter.
   */
  static async fetchModels(): Promise<OpenRouterModel[]> {
    return BackendClient.send<OpenRouterModel[]>({
      type: 'BACKEND_FETCH_MODELS'
    });
  }

  /**
   * Verifies the provided API key with OpenRouter.
   */
  static async testApiKey(apiKey: string): Promise<boolean> {
    return BackendClient.send<boolean>({
      type: 'BACKEND_TEST_KEY',
      payload: { apiKey }
    });
  }
}
