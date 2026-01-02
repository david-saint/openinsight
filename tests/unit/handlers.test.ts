import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  handleExplain, 
  handleFactCheck, 
  handleTestApiKey, 
  handleFetchModels 
} from '../../src/background/handlers';
import { OpenRouterService } from '../../src/background/openrouter-service';
import * as settings from '../../src/lib/settings';
import { ModelManager } from '../../src/lib/model-manager';

vi.mock('../../src/background/openrouter-service', () => ({
  OpenRouterService: {
    chatCompletion: vi.fn(),
    testKey: vi.fn(),
  },
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

  const mockSettings = {
    explainModel: 'test-model',
    explainSettings: {
      temperature: 0.5,
      max_tokens: 100,
      system_prompt: 'You are an explainer.'
    },
    factCheckModel: 'fact-model',
    factCheckSettings: {
      temperature: 0.2,
      max_tokens: 200,
      system_prompt: 'You are a fact-checker.'
    }
  };

  describe('handleExplain', () => {
    it('should call OpenRouterService with correct parameters', async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(OpenRouterService.chatCompletion).mockResolvedValue({ summary: 'Explanation result' });

      const result = await handleExplain('text to explain');

      expect(OpenRouterService.chatCompletion).toHaveBeenCalledWith({
        model: 'test-model',
        messages: [
          { role: 'system', content: expect.stringContaining('You are an expert explainer.') },
          { role: 'user', content: 'text to explain' }
        ],
        temperature: 0.5,
        max_tokens: 100,
      });
      expect(result).toEqual({ summary: 'Explanation result' });
    });

    it('should propagate errors from OpenRouterService', async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      const mockError = { type: 'auth', message: 'Unauthorized' };
      vi.mocked(OpenRouterService.chatCompletion).mockRejectedValue(mockError);

      await expect(handleExplain('test')).rejects.toEqual(mockError);
    });
  });

  describe('handleFactCheck', () => {
    it('should call OpenRouterService with correct parameters', async () => {
      vi.mocked(settings.getSettings).mockResolvedValue(mockSettings as any);
      vi.mocked(OpenRouterService.chatCompletion).mockResolvedValue({ summary: 'Fact check result' });

      const result = await handleFactCheck({ text: 'text to check' });

      expect(OpenRouterService.chatCompletion).toHaveBeenCalledWith({
        model: 'fact-model',
        messages: [
          { role: 'system', content: expect.stringContaining('You are an expert fact-checker.') },
          { role: 'user', content: 'text to check' }
        ],
        temperature: 0.2,
        max_tokens: 200,
      });
      expect(result).toEqual({ summary: 'Fact check result' });
    });
  });

  describe('handleTestApiKey', () => {
    it('should call OpenRouterService.testKey', async () => {
      vi.mocked(OpenRouterService.testKey).mockResolvedValue(true);

      const result = await handleTestApiKey('test-key');

      expect(OpenRouterService.testKey).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
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
