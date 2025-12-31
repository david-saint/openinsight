import { encrypt, decrypt } from './encryption';

/**
 * Generic storage setter.
 */
export async function setStorage(key: string, value: any): Promise<void> {
  return chrome.storage.local.set({ [key]: value });
}

/**
 * Generic storage getter.
 */
export async function getStorage<T = any>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T;
}

/**
 * Encrypted storage setter.
 */
export async function setEncrypted(
  key: string,
  value: string,
  password: string
): Promise<void> {
  const encrypted = await encrypt(value, password);
  return setStorage(key, encrypted);
}

/**
 * Encrypted storage getter.
 */
export async function getEncrypted(
  key: string,
  password: string
): Promise<string | undefined> {
  const encrypted = await getStorage<string>(key);
  if (!encrypted) return undefined;
  return decrypt(encrypted, password);
}
