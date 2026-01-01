import { getStorage, setStorage } from './storage';
import { OpenRouterModel, OpenRouterModelsResponse } from './types';

const CACHE_KEY = 'model_cache';
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

  private static async fetchAndCacheModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const json = await response.json() as OpenRouterModelsResponse;
      const models = json.data;

      await setStorage(CACHE_KEY, {
        models,
        timestamp: Date.now(),
      });

      return models;
    } catch (error) {
      console.error('ModelManager fetch error:', error);
      throw error;
    }
  }
}
