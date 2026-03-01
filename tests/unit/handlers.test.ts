import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleExplain,
  handleFactCheck,
  handleTestApiKey,
  handleFetchModels,
} from "../../src/background/handlers";
import { OpenRouterService } from "../../src/background/openrouter-service";
import * as settings from "../../src/lib/settings";
import { ModelManager } from "../../src/lib/model-manager";
import {
  EXPLAIN_RESPONSE_SCHEMA,
  FACT_CHECK_RESPONSE_SCHEMA,
} from "../../src/lib/types";

vi.mock("../../src/background/openrouter-service", () => ({
  OpenRouterService: {
    chatCompletion: vi.fn(),
    testKey: vi.fn(),
  },
}));

vi.mock("../../src/lib/settings", () => ({
  getSettings: vi.fn(),
  getApiKey: vi.fn(),
}));

vi.mock("../../src/lib/model-manager", () => ({
  ModelManager: {
    getModels: vi.fn(),
    supportsStructuredOutputs: vi.fn(),
  },
}));

describe("Background Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSettings = {
    explainModel: "test-model",
    explainSettings: {
      temperature: 0.5,
      max_tokens: 100,
      system_prompt: "You are an explainer.",
    },
    factCheckModel: "fact-model",
    factCheckSettings: {
      temperature: 0.2,
      max_tokens: 200,
      system_prompt: "You are a fact-checker.",
    },
  };

  describe("handleExplain", () => {
    it("should call OpenRouterService with correct parameters", async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(ModelManager.supportsStructuredOutputs).mockResolvedValue(true);
      vi.mocked(OpenRouterService.chatCompletion).mockResolvedValue({
        summary: "Explanation result",
      });

      const result = await handleExplain("text to explain");

      expect(OpenRouterService.chatCompletion).toHaveBeenCalledWith({
        model: "test-model",
        messages: [
          {
            role: "system",
            content: expect.stringContaining("You are an expert explainer."),
          },
          { role: "user", content: "text to explain" },
        ],
        temperature: 0.5,
        max_tokens: 100,
        response_format: EXPLAIN_RESPONSE_SCHEMA,
      });
      expect(result).toEqual({ summary: "Explanation result" });
    });

    it("should include emphasized words in the system prompt", async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(ModelManager.supportsStructuredOutputs).mockResolvedValue(true);
      vi.mocked(OpenRouterService.chatCompletion).mockResolvedValue({});

      await handleExplain("text", ["keyword1", "keyword2"]);

      const callArgs = vi.mocked(OpenRouterService.chatCompletion).mock.calls[0][0];
      const systemPrompt = callArgs.messages[0].content;
      expect(systemPrompt).toContain("THE USER HAS EMPHASIZED THESE KEYWORDS: keyword1, keyword2");
    });

    it("should propagate errors from OpenRouterService", async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(ModelManager.supportsStructuredOutputs).mockResolvedValue(true);
      const mockError = { type: "auth", message: "Unauthorized" };
      vi.mocked(OpenRouterService.chatCompletion).mockRejectedValue(mockError);

      await expect(handleExplain("test")).rejects.toEqual(mockError);
    });

    it("should retry with compatibility mode if first attempt fails", async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(ModelManager.supportsStructuredOutputs).mockResolvedValue(true);

      const mockError = {
        type: "llm",
        message: "Developer instruction is not enabled",
      };
      const mockSuccess = { summary: "Success after retry" };

      // First call fails, second succeeds
      vi.mocked(OpenRouterService.chatCompletion)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const result = await handleExplain("test");

      expect(OpenRouterService.chatCompletion).toHaveBeenCalledTimes(2);

      // Verify first call (Standard)
      expect(OpenRouterService.chatCompletion).toHaveBeenNthCalledWith(1, {
        model: "test-model",
        messages: [
          {
            role: "system",
            content: expect.stringContaining("You are an expert explainer."),
          },
          { role: "user", content: "test" },
        ],
        temperature: 0.5,
        max_tokens: 100,
        response_format: EXPLAIN_RESPONSE_SCHEMA,
      });

      // Verify second call (Compatibility Fallback)
      expect(OpenRouterService.chatCompletion).toHaveBeenNthCalledWith(2, {
        model: "test-model",
        messages: [
          {
            role: "user",
            content: expect.stringContaining("You are an expert explainer."),
          },
        ],
        temperature: 0.5,
        max_tokens: 100,
        // response_format should be absent
      });
      // Also verify the merged content specifically contains user prompt
      const secondCallArgs = vi.mocked(OpenRouterService.chatCompletion).mock
        .calls[1][0];
      const mergedContent = secondCallArgs.messages[0].content;
      expect(mergedContent).toContain("You are an expert explainer.");
      expect(mergedContent).toContain("test"); // Original user content

      expect(result).toEqual(mockSuccess);
    });
  });

  describe("handleFactCheck", () => {
    it("should call OpenRouterService with correct parameters", async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(ModelManager.supportsStructuredOutputs).mockResolvedValue(true);
      vi.mocked(OpenRouterService.chatCompletion).mockResolvedValue({
        summary: "Fact check result",
      });

      const result = await handleFactCheck({ text: "text to check" });

      expect(OpenRouterService.chatCompletion).toHaveBeenCalledWith({
        model: "fact-model",
        messages: [
          {
            role: "system",
            content: expect.stringContaining("You are an expert fact-checker."),
          },
          { role: "user", content: "CLAIM TO VERIFY:\ntext to check" },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: FACT_CHECK_RESPONSE_SCHEMA,
      });
      expect(result).toEqual({ summary: "Fact check result" });
    });

    it("should include emphasized words in the system prompt", async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(ModelManager.supportsStructuredOutputs).mockResolvedValue(true);
      vi.mocked(OpenRouterService.chatCompletion).mockResolvedValue({});

      await handleFactCheck({ text: "text", emphasizedWords: ["word1"] });

      const callArgs = vi.mocked(OpenRouterService.chatCompletion).mock.calls[0][0];
      const systemPrompt = callArgs.messages[0].content;
      expect(systemPrompt).toContain("THE USER HAS EMPHASIZED THESE KEYWORDS: word1");
    });
  });

  describe("handleTestApiKey", () => {
    it("should call OpenRouterService.testKey", async () => {
      vi.mocked(OpenRouterService.testKey).mockResolvedValue(true);

      const result = await handleTestApiKey("test-key");

      expect(OpenRouterService.testKey).toHaveBeenCalledWith("test-key");
      expect(result).toBe(true);
    });
  });

  describe("handleFetchModels", () => {
    it("should return models from ModelManager", async () => {
      const mockModels = [{ id: "m1", name: "M1" }];
      vi.mocked(ModelManager.getModels).mockResolvedValue(mockModels as any);

      const result = await handleFetchModels();

      expect(ModelManager.getModels).toHaveBeenCalled();
      expect(result).toEqual(mockModels);
    });
  });
});
