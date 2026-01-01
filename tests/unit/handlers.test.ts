import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleExplain, handleFactCheck } from '../../src/background/handlers';
import * as api from '../../src/background/api';
import * as settings from '../../src/lib/settings';

// Mock API and settings
vi.mock('../../src/background/api', () => ({
  fetchWithAuth: vi.fn(),
}));

vi.mock('../../src/lib/settings', () => ({
  getSettings: vi.fn(),
  getApiKey: vi.fn(),
}));

describe('Background Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleExplain', () => {
    it('should send correctly formatted explain prompt', async () => {
      const mockSettings = {
        explainModel: 'test-model',
        explainSettings: {
          temperature: 0.5,
          max_tokens: 100,
          system_prompt: 'You are an explainer.'
        }
      };
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      
      const mockResponse = {
        choices: [{ message: { content: 'Explanation result' } }]
      };
      vi.mocked(api.fetchWithAuth).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await handleExplain('text to explain');

      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            model: 'test-model',
            messages: [
              { role: 'system', content: 'You are an explainer.' },
              { role: 'user', content: 'text to explain' }
            ],
            temperature: 0.5,
            max_tokens: 100,
          })
        })
      );
      expect(result).toBe('Explanation result');
    });

    it('should throw error if fetch fails', async () => {
      vi.mocked(settings.getSettings).mockResolvedValue({
        explainModel: 'm',
        explainSettings: { temperature: 0, max_tokens: 0, system_prompt: 's' }
      } as any);
      
      vi.mocked(api.fetchWithAuth).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Internal Server Error'
      } as Response);

      await expect(handleExplain('test')).rejects.toThrow('Failed to explain: Internal Server Error');
    });
  });

  describe('handleFactCheck', () => {
    it('should send correctly formatted fact-check prompt', async () => {
      const mockSettings = {
        factCheckModel: 'fact-model',
        factCheckSettings: {
          temperature: 0.2,
          max_tokens: 200,
          system_prompt: 'You are a fact-checker.'
        }
      };
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      
      const mockResponse = {
        choices: [{ message: { content: 'Fact check result' } }]
      };
      vi.mocked(api.fetchWithAuth).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await handleFactCheck('text to check');

      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            model: 'fact-model',
            messages: [
              { role: 'system', content: 'You are a fact-checker.' },
              { role: 'user', content: 'text to check' }
            ],
            temperature: 0.2,
            max_tokens: 200,
          })
        })
      );
      expect(result).toBe('Fact check result');
    });
  });
});
