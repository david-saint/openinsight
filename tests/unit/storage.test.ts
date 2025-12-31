import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setStorage, getStorage, setEncrypted, getEncrypted } from '../../src/lib/storage';

// Mock chrome.storage
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', chromeMock);

// Mock encryption
vi.mock('../../src/lib/encryption', () => ({
  encrypt: vi.fn().mockResolvedValue('encrypted-data'),
  decrypt: vi.fn().mockResolvedValue('decrypted-data'),
}));

describe('Storage Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set and get plain data', async () => {
    chromeMock.storage.local.get.mockResolvedValue({ key: 'value' });
    
    await setStorage('key', 'value');
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ key: 'value' });
    
    const value = await getStorage('key');
    expect(value).toBe('value');
  });

  it('should set and get encrypted data', async () => {
    chromeMock.storage.local.get.mockResolvedValue({ secureKey: 'encrypted-data' });
    
    await setEncrypted('secureKey', 'decrypted-data', 'password');
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ secureKey: 'encrypted-data' });
    
    const value = await getEncrypted('secureKey', 'password');
    expect(value).toBe('decrypted-data');
  });
});
