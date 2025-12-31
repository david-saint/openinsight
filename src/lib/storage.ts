import { encryptData, decryptData, generateKey } from './encryption';

const API_KEY_STORAGE_KEY = 'encryptedApiKey';

/**
 * Saves the API key to chrome.storage.local after encrypting it.
 */
export const saveApiKey = async (apiKey: string, password: string): Promise<void> => {
  const key = await generateKey(password);
  const encrypted = await encryptData(apiKey, key);
  
  await chrome.storage.local.set({
    [API_KEY_STORAGE_KEY]: encrypted
  });
};

/**
 * Retrieves the API key from chrome.storage.local and decrypts it.
 */
export const getApiKey = async (password: string): Promise<string | null> => {
  const data = await chrome.storage.local.get(API_KEY_STORAGE_KEY);
  const encrypted = data[API_KEY_STORAGE_KEY];
  
  if (!encrypted) {
    return null;
  }
  
  const key = await generateKey(password);
  return await decryptData(encrypted, key);
};

/**
 * Checks if an API key is currently stored.
 */
export const hasApiKey = async (): Promise<boolean> => {
  const data = await chrome.storage.local.get(API_KEY_STORAGE_KEY);
  return !!data[API_KEY_STORAGE_KEY];
};

/**
 * Removes the stored API key.
 */
export const removeApiKey = async (): Promise<void> => {
  await chrome.storage.local.remove(API_KEY_STORAGE_KEY);
};