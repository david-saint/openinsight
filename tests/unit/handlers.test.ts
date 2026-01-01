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

  // ... (previous handleExplain and handleFactCheck tests)

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

    it('should throw error if probe request fails', async () => {
      vi.mocked(api.fetchWithAuth).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response);

      await expect(handleTestApiKey('bad-key')).rejects.toThrow('API Key verification failed: Unauthorized');
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
