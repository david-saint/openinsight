import { getStorage, setStorage } from "./storage";
import { OpenRouterModel, OpenRouterModelsResponse } from "./types";

const CACHE_KEY = "model_cache";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ModelCache {
  models: OpenRouterModel[];
  timestamp: number;
}

export class ModelManager {
  static async getModels(): Promise<OpenRouterModel[]> {
    const cached = await getStorage<ModelCache>(CACHE_KEY);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return cached.models;
    }

    return ModelManager.fetchAndCacheModels();
  }

  /**
   * Gets models sorted by price (free first, then by prompt cost).
   */
  static async getModelsSortedByPrice(): Promise<OpenRouterModel[]> {
    const models = await ModelManager.getModels();
    return ModelManager.sortByPrice(models);
  }

  /**
   * Sorts models by price (free first, then ascending by prompt cost).
   */
  static sortByPrice(models: OpenRouterModel[]): OpenRouterModel[] {
    return [...models].sort((a, b) => {
      const priceA = parseFloat(a.pricing.prompt) || 0;
      const priceB = parseFloat(b.pricing.prompt) || 0;
      return priceA - priceB;
    });
  }

  /**
   * Checks if a model is free (prompt price is 0).
   */
  static isFreeModel(model: OpenRouterModel): boolean {
    return parseFloat(model.pricing.prompt) === 0;
  }

  /**
   * Formats price per 1M tokens for display.
   */
  static formatPrice(pricePerToken: string): string {
    const price = parseFloat(pricePerToken);
    if (price === 0) return "Free";
    if (price < 0) return "Variable";
    // Price is per token, multiply by 1M for display
    const perMillion = price * 1_000_000;
    if (perMillion < 1) return `$${perMillion.toFixed(4)}/1M`;
    return `$${perMillion.toFixed(2)}/1M`;
  }

  private static async fetchAndCacheModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const json = (await response.json()) as OpenRouterModelsResponse;
      const models = json.data;

      await setStorage(CACHE_KEY, {
        models,
        timestamp: Date.now(),
      });

      return models;
    } catch (error) {
      console.error("ModelManager fetch error:", error);
      throw error;
    }
  }
}
