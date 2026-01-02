import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterService } from '../../src/background/openrouter-service';
import * as settings from '../../src/lib/settings';

vi.mock('../../src/lib/settings', () => ({
  getApiKey: vi.fn(),
}));

describe('OpenRouterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should call chat completions API and parse JSON content', async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue('test-key');
    
    const mockChatResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ summary: 'test', explanation: 'test' })
          }
        }
      ]
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChatResponse)
    } as Response);

    const result = await OpenRouterService.chatCompletion({
      model: 'test-model',
      messages: [{ role: 'user', content: 'test' }]
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers)
      })
    );
    expect(result).toEqual({ summary: 'test', explanation: 'test' });
  });

  it('should handle non-JSON content gracefully (fallback to string summary)', async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue('test-key');
    
    const mockChatResponse = {
      choices: [
        {
          message: {
            content: 'Not a JSON'
          }
        }
      ]
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChatResponse)
    } as Response);

    const result = await OpenRouterService.chatCompletion({
      model: 'test-model',
      messages: [{ role: 'user', content: 'test' }]
    });

    expect(result).toEqual({ summary: 'Not a JSON' });
  });

  it('should handle API errors with structured AppError', async () => {
    vi.mocked(settings.getApiKey).mockResolvedValue('test-key');
    
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Invalid API key')
    } as Response);

    await expect(OpenRouterService.chatCompletion({
      model: 'test-model',
      messages: []
    })).rejects.toMatchObject({
      type: 'auth',
      code: '401'
    });
  });
});
