import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModelManager } from '../../src/lib/model-manager';
import * as storage from '../../src/lib/storage';

// Mock storage
vi.mock('../../src/lib/storage', () => ({
  getStorage: vi.fn(),
  setStorage: vi.fn(),
}));

describe('ModelManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch models from API if cache is empty', async () => {
    vi.mocked(storage.getStorage).mockResolvedValue(undefined);
    
    const mockResponse = {
      data: [{ id: 'model-1', name: 'Model 1', context_length: 1000, pricing: { prompt: '0', completion: '0' } }]
    };
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const models = await ModelManager.getModels();

    expect(global.fetch).toHaveBeenCalledWith('https://openrouter.ai/api/v1/models');
    expect(models).toEqual(mockResponse.data);
    expect(storage.setStorage).toHaveBeenCalledWith('model_cache', expect.objectContaining({
      models: mockResponse.data,
      timestamp: expect.any(Number)
    }));
  });

  it('should return cached models if valid', async () => {
    const cachedModels = [{ id: 'model-1', name: 'Model 1', context_length: 1000, pricing: { prompt: '0', completion: '0' } }];
    const timestamp = Date.now();
    
    vi.mocked(storage.getStorage).mockResolvedValue({
      models: cachedModels,
      timestamp: timestamp
    });

    global.fetch = vi.fn();

    const models = await ModelManager.getModels();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(models).toEqual(cachedModels);
  });

  it('should refresh cache if expired (24h)', async () => {
    const cachedModels = [{ id: 'old-model', name: 'Old Model', context_length: 1000, pricing: { prompt: '0', completion: '0' } }];
    const timestamp = Date.now() - (24 * 60 * 60 * 1000) - 1; // 24h + 1ms ago
    
    vi.mocked(storage.getStorage).mockResolvedValue({
      models: cachedModels,
      timestamp: timestamp
    });

    const newModels = [{ id: 'new-model', name: 'New Model', context_length: 2000, pricing: { prompt: '0', completion: '0' } }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: newModels }),
    } as Response);

    const models = await ModelManager.getModels();

    expect(global.fetch).toHaveBeenCalled();
    expect(models).toEqual(newModels);
  });
});
