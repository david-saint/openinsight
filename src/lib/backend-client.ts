import { sendMessage } from "./messaging.js";
import type {
  OpenRouterModel,
  ExplainResponse,
  FactCheckResponse,
} from "./types.js";

/**
 * Client class to interact with the background service worker.
 * Provides a clean, typed abstraction for all backend actions.
 */
export class BackendClient {
  /**
   * Requests an explanation for the provided text.
   * Returns a structured ExplainResponse object.
   */
  static async explainText(
    text: string,
    emphasizedWords: string[] = []
  ): Promise<ExplainResponse> {
    return sendMessage("BACKEND_EXPLAIN", { text, emphasizedWords });
  }

  /**
   * Requests a fact-check for the provided text with context.
   * Returns a structured FactCheckResponse object.
   */
  static async factCheckText(
    text: string,
    context: {
      paragraph: string;
      pageTitle: string;
      pageDescription: string;
    },
    emphasizedWords: string[] = []
  ): Promise<FactCheckResponse> {
    return sendMessage("BACKEND_FACT_CHECK", { text, context, emphasizedWords });
  }

  /**
   * Fetches the list of available models from OpenRouter.
   */
  static async fetchModels(): Promise<OpenRouterModel[]> {
    return sendMessage("BACKEND_FETCH_MODELS", undefined);
  }

  /**
   * Verifies the provided API key with OpenRouter.
   */
  static async testApiKey(apiKey: string): Promise<boolean> {
    return sendMessage("BACKEND_TEST_KEY", { apiKey });
  }
}
