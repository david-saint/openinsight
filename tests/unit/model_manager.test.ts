import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ModelManager } from "../../src/lib/model-manager.js";
import * as storage from "../../src/lib/storage.js";

// Mock storage
vi.mock("../../src/lib/storage", () => ({
  getStorage: vi.fn(),
  setStorage: vi.fn(),
}));

describe("ModelManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should fetch models from API if cache is empty", async () => {
    vi.mocked(storage.getStorage).mockResolvedValue(undefined);

    const mockResponse = {
      data: [
        {
          id: "model-1",
          name: "Model 1",
          context_length: 1000,
          pricing: { prompt: "0", completion: "0" },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const models = await ModelManager.getModels();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/models"
    );
    expect(models).toEqual(mockResponse.data);
    expect(storage.setStorage).toHaveBeenCalledWith(
      "model_cache",
      expect.objectContaining({
        models: mockResponse.data,
        timestamp: expect.any(Number),
      })
    );
  });

  it("should return cached models if valid", async () => {
    const cachedModels = [
      {
        id: "model-1",
        name: "Model 1",
        context_length: 1000,
        pricing: { prompt: "0", completion: "0" },
      },
    ];
    const timestamp = Date.now();

    vi.mocked(storage.getStorage).mockResolvedValue({
      models: cachedModels,
      timestamp: timestamp,
    });

    global.fetch = vi.fn();

    const models = await ModelManager.getModels();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(models).toEqual(cachedModels);
  });

  it("should refresh cache if expired (24h)", async () => {
    const cachedModels = [
      {
        id: "old-model",
        name: "Old Model",
        context_length: 1000,
        pricing: { prompt: "0", completion: "0" },
      },
    ];
    const timestamp = Date.now() - 24 * 60 * 60 * 1000 - 1; // 24h + 1ms ago

    vi.mocked(storage.getStorage).mockResolvedValue({
      models: cachedModels,
      timestamp: timestamp,
    });

    const newModels = [
      {
        id: "new-model",
        name: "New Model",
        context_length: 2000,
        pricing: { prompt: "0", completion: "0" },
      },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: newModels }),
    } as Response);

    const models = await ModelManager.getModels();

    expect(global.fetch).toHaveBeenCalled();
    expect(models).toEqual(newModels);
  });

  describe("sortByPrice", () => {
    it("should sort models by prompt price ascending", () => {
      const models = [
        { id: "expensive", pricing: { prompt: "0.00001", completion: "0" } },
        { id: "free", pricing: { prompt: "0", completion: "0" } },
        { id: "mid", pricing: { prompt: "0.000005", completion: "0" } },
      ] as any[];

      const sorted = ModelManager.sortByPrice(models);
      expect(sorted[0].id).toBe("free");
      expect(sorted[1].id).toBe("mid");
      expect(sorted[2].id).toBe("expensive");
    });
  });

  describe("isFreeModel", () => {
    it("should identify free models correctly", () => {
      expect(
        ModelManager.isFreeModel({ pricing: { prompt: "0" } } as any)
      ).toBe(true);
      expect(
        ModelManager.isFreeModel({ pricing: { prompt: "0.00001" } } as any)
      ).toBe(false);
      expect(
        ModelManager.isFreeModel({ pricing: { prompt: "-1" } } as any)
      ).toBe(false);
    });
  });

  describe("formatPrice", () => {
    it("should format different price values correctly", () => {
      expect(ModelManager.formatPrice("0")).toBe("Free");
      expect(ModelManager.formatPrice("-1")).toBe("Variable");
      // 0.000001 per token = $1 per 1M tokens
      expect(ModelManager.formatPrice("0.000001")).toBe("$1.00/1M");
      // 0.000000075 per token = $0.075 per 1M tokens
      expect(ModelManager.formatPrice("0.000000075")).toBe("$0.0750/1M");
      // Very cheap: 0.000000001 per token = $0.001 per 1M tokens
      expect(ModelManager.formatPrice("0.000000001")).toBe("$0.0010/1M");
    });
  });
});
