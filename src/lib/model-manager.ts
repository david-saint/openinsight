import { getStorage, setStorage } from "./storage.js";
import type { OpenRouterModel, OpenRouterModelsResponse } from "./types.js";

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
   * Checks if a model accepts image input.
   */
  static supportsImageInput(model: OpenRouterModel): boolean {
    return model.architecture?.input_modalities?.includes("image") ?? false;
  }

  /**
   * Filters a list to models that accept image input.
   */
  static filterImageInputModels(models: OpenRouterModel[]): OpenRouterModel[] {
    return models.filter((model) => ModelManager.supportsImageInput(model));
  }

  /**
   * Checks whether the given model ID accepts image input.
   * Returns `null` when support cannot be determined due to a fetch/storage error.
   */
  static async modelSupportsImageInput(modelId: string): Promise<boolean | null> {
    try {
      const models = await ModelManager.getModels();
      const model = models.find((m) => m.id === modelId);
      return model ? ModelManager.supportsImageInput(model) : false;
    } catch (error) {
      console.warn(`Failed to determine image input support for model "${modelId}"`, error);
      return null;
    }
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

  /**
   * Checks if a model supports structured outputs (JSON Schema mode).
   * @param modelId - The model ID to check (e.g., "google/gemma-3-27b-it:free")
   * @returns True if the model supports structured_outputs, false otherwise
   */
  static async supportsStructuredOutputs(modelId: string): Promise<boolean> {
    try {
      const models = await ModelManager.getModels();
      const model = models.find((m) => m.id === modelId);
      if (!model?.supported_parameters) {
        return false;
      }
      return model.supported_parameters.includes("structured_outputs");
    } catch {
      // If we can't check, assume it doesn't support it to be safe
      return false;
    }
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
