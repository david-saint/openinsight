import { describe, it, expect, beforeEach } from 'vitest';
import { encrypt, decrypt } from '../../src/lib/encryption';
import { webcrypto } from 'node:crypto';

// Use Node's webcrypto for tests
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = webcrypto;
}

describe('Encryption Utility', () => {
  const password = 'test-password';
  const text = 'sensitive-api-key';

  it('should encrypt and decrypt correctly', async () => {
    const encrypted = await encrypt(text, password);
    expect(encrypted).not.toBe(text);
    
    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe(text);
  });

  it('should fail to decrypt with wrong password', async () => {
    const encrypted = await encrypt(text, password);
    await expect(decrypt(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('should produce different ciphertexts for same input (due to IV)', async () => {
    const encrypted1 = await encrypt(text, password);
    const encrypted2 = await encrypt(text, password);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should encrypt and decrypt an empty string', async () => {
    const emptyText = '';
    const encrypted = await encrypt(emptyText, password);
    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe(emptyText);
  });
});
