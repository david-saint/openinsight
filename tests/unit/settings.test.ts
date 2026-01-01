import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSettings, saveSettings, getApiKey, saveApiKey, DEFAULT_SETTINGS } from '../../src/lib/settings';
import * as storage from '../../src/lib/storage';

// Mock storage
vi.mock('../../src/lib/storage', () => ({
  getStorage: vi.fn(),
  setStorage: vi.fn(),
  getEncrypted: vi.fn(),
  setEncrypted: vi.fn(),
}));

describe('Settings Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return default settings when storage is empty', async () => {
      vi.mocked(storage.getStorage).mockResolvedValue(undefined);

      const settings = await getSettings();

      expect(storage.getStorage).toHaveBeenCalledWith('user_settings');
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should return stored settings merged with defaults', async () => {
      const storedSettings = { theme: 'dark' };
      vi.mocked(storage.getStorage).mockResolvedValue(storedSettings);

      const settings = await getSettings();

      expect(storage.getStorage).toHaveBeenCalledWith('user_settings');
      expect(settings).toEqual({ ...DEFAULT_SETTINGS, ...storedSettings });
    });
  });

  describe('saveSettings', () => {
    it('should save settings to storage', async () => {
      const newSettings = { theme: 'dark' } as any;
      await saveSettings(newSettings);

      expect(storage.setStorage).toHaveBeenCalledWith('user_settings', newSettings);
    });
  });

  describe('API Key Management', () => {
    it('should save API key securely', async () => {
      await saveApiKey('secret-key');
      // The password 'openinsight_local_obfuscation' is assumed implementation detail
      expect(storage.setEncrypted).toHaveBeenCalledWith('api_key', 'secret-key', expect.any(String));
    });

    it('should retrieve API key securely', async () => {
      vi.mocked(storage.getEncrypted).mockResolvedValue('secret-key');
      const key = await getApiKey();
      expect(storage.getEncrypted).toHaveBeenCalledWith('api_key', expect.any(String));
      expect(key).toBe('secret-key');
    });
  });

  describe('LLM Settings', () => {
    it('should have default LLM settings', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('explainSettings');
      expect(DEFAULT_SETTINGS).toHaveProperty('factCheckSettings');
      
      // @ts-ignore
      expect(DEFAULT_SETTINGS.explainSettings).toHaveProperty('temperature');
      // @ts-ignore
      expect(DEFAULT_SETTINGS.factCheckSettings).toHaveProperty('system_prompt');
    });
  });
});
