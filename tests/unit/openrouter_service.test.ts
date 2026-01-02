import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterService } from "../../src/background/openrouter-service";
import * as settings from "../../src/lib/settings";

vi.mock("../../src/lib/settings", () => ({
  getApiKey: vi.fn(),
}));

describe("OpenRouterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("should call chat completions API and parse JSON content", async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue("test-key");

    const mockChatResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ summary: "test", explanation: "test" }),
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChatResponse),
    } as Response);

    const result = await OpenRouterService.chatCompletion({
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
      })
    );
    expect(result).toEqual({ summary: "test", explanation: "test" });
  });

  it("should handle non-JSON content gracefully (fallback to string summary)", async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue("test-key");

    const mockChatResponse = {
      choices: [
        {
          message: {
            content: "Not a JSON",
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChatResponse),
    } as Response);

    const result = await OpenRouterService.chatCompletion({
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    });

    expect(result).toEqual({
      summary: "Not a JSON",
      error: "Failed to parse LLM response as JSON",
    });
  });

  it("should handle API errors with structured AppError", async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue("test-key");

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: () => Promise.resolve("Invalid API key"),
    } as Response);

    await expect(
      OpenRouterService.chatCompletion({
        model: "test-model",
        messages: [],
      })
    ).rejects.toMatchObject({
      type: "auth",
      code: "401",
    });
  });

  it("should strip markdown code fences from JSON responses", async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue("test-key");

    const mockChatResponse = {
      choices: [
        {
          message: {
            content:
              '```json\n{"summary": "test", "explanation": "parsed"}\n```',
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChatResponse),
    } as Response);

    const result = await OpenRouterService.chatCompletion({
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    });

    expect(result).toEqual({ summary: "test", explanation: "parsed" });
  });

  it("should handle code fences with extra whitespace", async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue("test-key");

    const mockChatResponse = {
      choices: [
        {
          message: {
            content: '  ```json  \n  {"verdict": "True"}  \n  ```  ',
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChatResponse),
    } as Response);

    const result = await OpenRouterService.chatCompletion({
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    });

    expect(result).toEqual({ verdict: "True" });
  });

  it("should normalize smart/curly quotes to straight quotes", async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue("test-key");

    // Smart quotes used as JSON delimiters (the actual problem case)
    const mockChatResponse = {
      choices: [
        {
          message: {
            // Using curly quotes as JSON string delimiters: "key": "value"
            content:
              "{\u201Csummary\u201D: \u201CTest response\u201D, \u201Cverdict\u201D: \u201CTrue\u201D}",
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChatResponse),
    } as Response);

    const result = await OpenRouterService.chatCompletion({
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    });

    expect(result).toEqual({ summary: "Test response", verdict: "True" });
  });
});
