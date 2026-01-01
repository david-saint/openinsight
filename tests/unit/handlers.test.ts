import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleExplain, handleFactCheck, handleTestApiKey, handleFetchModels } from '../../src/background/handlers';
import * as api from '../../src/background/api';
import * as settings from '../../src/lib/settings';
import { ModelManager } from '../../src/lib/model-manager';

// Mock API, settings and ModelManager
vi.mock('../../src/background/api', () => ({
  fetchWithAuth: vi.fn(),
}));

vi.mock('../../src/lib/settings', () => ({
  getSettings: vi.fn(),
  getApiKey: vi.fn(),
}));

vi.mock('../../src/lib/model-manager', () => ({
  ModelManager: {
    getModels: vi.fn(),
  },
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

    it('should return typed AppError if fetch fails', async () => {
      vi.mocked(settings.getSettings).mockResolvedValue({
        explainModel: 'm',
        explainSettings: { temperature: 0, max_tokens: 0, system_prompt: 's' }
      } as any);
      
      vi.mocked(api.fetchWithAuth).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Unauthorized'
      } as Response);

      try {
        await handleExplain('test');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.type).toBe('auth');
        expect(error.message).toContain('Unauthorized');
      }
    });

    it('should return typed AppError for network failures', async () => {
      vi.mocked(settings.getSettings).mockResolvedValue({
        explainModel: 'm',
        explainSettings: { temperature: 0, max_tokens: 0, system_prompt: 's' }
      } as any);
      
      vi.mocked(api.fetchWithAuth).mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await handleExplain('test');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.type).toBe('network');
        expect(error.message).toContain('Failed to fetch');
      }
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

  describe('handleTestApiKey', () => {
    it('should return true if probe request succeeds', async () => {
      vi.mocked(api.fetchWithAuth).mockResolvedValue({
        ok: true,
      } as Response);

      const result = await handleTestApiKey('new-key');

      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/auth/key',
        expect.objectContaining({ method: 'GET' }),
        'new-key'
      );
      expect(result).toBe(true);
    });

    it('should return typed AppError if probe request fails', async () => {
      vi.mocked(api.fetchWithAuth).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => 'Rate limited'
      } as Response);

      try {
        await handleTestApiKey('bad-key');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.type).toBe('rate_limit');
        expect(error.message).toContain('Too Many Requests');
      }
    });
  });

  describe('handleFetchModels', () => {
    it('should return models from ModelManager', async () => {
      const mockModels = [{ id: 'm1', name: 'M1' }];
      vi.mocked(ModelManager.getModels).mockResolvedValue(mockModels as any);

      const result = await handleFetchModels();

      expect(ModelManager.getModels).toHaveBeenCalled();
      expect(result).toEqual(mockModels);
    });
  });
});