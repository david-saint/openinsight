import { describe, it, expect, beforeEach } from 'vitest';
import { encryptData, decryptData, generateKey } from './encryption';

describe('Encryption Module', () => {
  let cryptoKey: CryptoKey;
  const testData = 'sk-or-v1-my-secret-key';

  beforeEach(async () => {
    cryptoKey = await generateKey('user-password-or-similar');
  });

  it('successfully encrypts and decrypts data', async () => {
    const encrypted = await encryptData(testData, cryptoKey);
    expect(encrypted).not.toBe(testData);
    expect(typeof encrypted).toBe('string');

    const decrypted = await decryptData(encrypted, cryptoKey);
    expect(decrypted).toBe(testData);
  });

  it('fails to decrypt with a different key', async () => {
    const encrypted = await encryptData(testData, cryptoKey);
    const otherKey = await generateKey('different-password');
    
    await expect(decryptData(encrypted, otherKey)).rejects.toThrow();
  });
});
