import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveApiKey, getApiKey, hasApiKey, removeApiKey } from './storage';
import * as encryption from './encryption';

// Mock chrome.storage.local
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
};
vi.stubGlobal('chrome', chromeMock);

describe('Storage Module', () => {
  const testKey = 'sk-or-v1-test-key';
  const password = 'test-password';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves an encrypted API key', async () => {
    await saveApiKey(testKey, password);
    
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        encryptedApiKey: expect.any(String)
      })
    );
  });

  it('retrieves and decrypts the API key', async () => {
    // First save it to get the encrypted value
    let savedValue: string = '';
    chromeMock.storage.local.set.mockImplementation((data) => {
      savedValue = data.encryptedApiKey;
      return Promise.resolve();
    });
    
    await saveApiKey(testKey, password);
    
    chromeMock.storage.local.get.mockResolvedValue({ encryptedApiKey: savedValue });
    
    const retrieved = await getApiKey(password);
    expect(retrieved).toBe(testKey);
  });

  it('returns true if API key exists', async () => {
    chromeMock.storage.local.get.mockResolvedValue({ encryptedApiKey: 'some-value' });
    const exists = await hasApiKey();
    expect(exists).toBe(true);
  });

  it('returns null if API key does not exist', async () => {
    chromeMock.storage.local.get.mockResolvedValue({});
    const key = await getApiKey(password);
    expect(key).toBeNull();
  });

  it('removes the API key', async () => {
    await removeApiKey();
    expect(chromeMock.storage.local.remove).toHaveBeenCalledWith('encryptedApiKey');
  });
});

