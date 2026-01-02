import { getApiKey } from "../lib/settings.js";
import type {
  OpenRouterChatResponse,
  OpenRouterMessage,
  AppError,
  ErrorType,
} from "../lib/types.js";

/**
 * Service to interact with the OpenRouter API.
 * Handles authentication, fetching, response parsing, and error mapping.
 */
export class OpenRouterService {
  private static readonly API_BASE = "https://openrouter.ai/api/v1";

  /**
   * Internal helper to map HTTP responses and exceptions to typed AppErrors.
   */
  private static async mapError(
    responseOrError: any,
    context: string
  ): Promise<AppError> {
    // Duck-typing for Response check
    if (
      responseOrError &&
      typeof responseOrError.status === "number" &&
      typeof responseOrError.text === "function"
    ) {
      const status = responseOrError.status;
      const statusText = responseOrError.statusText;
      let errorText = "";
      try {
        errorText = await responseOrError.text();
      } catch (e) {
        // Ignore text parse errors
      }

      let type: ErrorType = "unknown";
      if (status === 401) type = "auth";
      else if (status === 429) type = "rate_limit";
      else if (status >= 400 && status < 500) type = "llm";
      else if (status >= 500) type = "llm";

      return {
        type,
        message: `${context}: ${
          statusText || errorText || "Unknown error"
        } (${status})`,
        code: status.toString(),
      };
    }

    const isNetworkError =
      responseOrError instanceof TypeError ||
      responseOrError?.message?.includes("network");
    return {
      type: isNetworkError ? "network" : "unknown",
      message: `${context}: ${responseOrError?.message || "Unexpected error"}`,
    };
  }

  /**
   * Enhanced fetch that automatically attaches the OpenRouter API key.
   */
  private static async fetchWithAuth(
    path: string,
    init?: RequestInit,
    overrideApiKey?: string
  ): Promise<Response> {
    const apiKey = overrideApiKey || (await getApiKey());

    if (!apiKey) {
      throw {
        type: "auth",
        message: "API key not found. Please set it in the extension options.",
      } as AppError;
    }

    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${apiKey}`);
    headers.set("Content-Type", "application/json");
    headers.set("HTTP-Referer", "https://github.com/david-saint/openinsight");
    headers.set("X-Title", "OpenInsight");

    return fetch(`${this.API_BASE}${path}`, {
      ...init,
      headers,
    });
  }

  /**
   * Requests a chat completion from OpenRouter.
   * Automatically parses the response content as JSON if possible.
   */
  static async chatCompletion(params: {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
  }): Promise<any> {
    try {
      const response = await this.fetchWithAuth("/chat/completions", {
        method: "POST",
        body: JSON.stringify({
          model: params.model,
          messages: params.messages,
          temperature: params.temperature,
          max_tokens: params.max_tokens,
        }),
      });

      if (!response.ok) {
        throw await this.mapError(response, "OpenRouter API error");
      }

      const data = (await response.json()) as OpenRouterChatResponse;
      const message = data.choices?.[0]?.message;

      if (!message?.content) {
        throw {
          type: "llm",
          message: "No content in LLM response",
        } as AppError;
      }

      let content = message.content;

      // Strip markdown code fences if present (LLMs often wrap JSON in ```json ... ```)
      if (content.startsWith("```")) {
        content = content
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/, "");
      }

      try {
        return JSON.parse(content);
      } catch (e) {
        // If not JSON, return as summary for backward compatibility or simple responses
        return {
          summary: content,
          error: "Failed to parse LLM response as JSON",
        };
      }
    } catch (error) {
      if ((error as AppError).type) throw error;
      throw await this.mapError(error, "OpenRouter request failed");
    }
  }

  /**
   * Verifies the provided API key.
   */
  static async testKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(
        "/auth/key",
        {
          method: "GET",
        },
        apiKey
      );

      if (!response.ok) {
        throw await this.mapError(response, "API Key verification failed");
      }

      return true;
    } catch (error) {
      if ((error as AppError).type) throw error;
      throw await this.mapError(error, "API Key verification failed");
    }
  }
}
