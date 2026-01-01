import { getStorage, setStorage, getEncrypted, setEncrypted } from './storage';
import { LLMSettings } from './types';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  accentColor: 'teal' | 'indigo' | 'rose' | 'amber';
  explainModel: string;
  factCheckModel: string;
  triggerMode: 'icon' | 'immediate';
  explainSettings: LLMSettings;
  factCheckSettings: LLMSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  accentColor: 'teal',
  explainModel: 'google/gemini-2.0-flash-exp:free',
  factCheckModel: 'google/gemini-2.0-flash-exp:free',
  triggerMode: 'icon',
  explainSettings: {
    temperature: 0.7,
    max_tokens: 512,
    system_prompt: 'You are an expert explainer. Provide a concise, clear, and objective explanation of the following text or concept. Focus on clarity and neutrality.'
  },
  factCheckSettings: {
    temperature: 0.3,
    max_tokens: 512,
    system_prompt: 'You are an expert fact-checker. Verify the accuracy of the following text. Provide a verdict (True/False/Mixed) and a brief justification with sources if possible.'
  }
};

export const SETTINGS_KEY = 'user_settings';
const API_KEY_KEY = 'api_key';
// Key for AES-GCM encryption. 
// Note: In a client-side extension without user password, this acts as obfuscation against casual inspection.
const OBFUSCATION_KEY = 'openinsight_local_obfuscation';

export async function getSettings(): Promise<Settings> {
  const stored = await getStorage<Partial<Settings>>(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setStorage(SETTINGS_KEY, settings);
}

export async function getApiKey(): Promise<string | undefined> {
  return getEncrypted(API_KEY_KEY, OBFUSCATION_KEY);
}

export async function saveApiKey(apiKey: string): Promise<void> {
  await setEncrypted(API_KEY_KEY, apiKey, OBFUSCATION_KEY);
}