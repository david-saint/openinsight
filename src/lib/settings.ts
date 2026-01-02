import {
  getStorage,
  setStorage,
  getEncrypted,
  setEncrypted,
} from "./storage.js";
import type { LLMSettings } from "./types.js";
import type { StylePreference } from "./prompt-manager.js";

export interface Settings {
  theme: "light" | "dark" | "system";
  accentColor: "teal" | "indigo" | "rose" | "amber";
  explainModel: string;
  factCheckModel: string;
  triggerMode: "icon" | "immediate";
  stylePreference: StylePreference;
  explainSettings: LLMSettings;
  factCheckSettings: LLMSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  accentColor: "teal",
  explainModel: "google/gemini-2.0-flash-exp:free",
  factCheckModel: "google/gemini-2.0-flash-exp:free",
  triggerMode: "icon",
  stylePreference: "Concise",
  explainSettings: {
    temperature: 0.1, // Lower temperature for more consistent JSON
    max_tokens: 1000,
    system_prompt: "", // No longer used for direct user editing
  },
  factCheckSettings: {
    temperature: 0.1,
    max_tokens: 1000,
    system_prompt: "", // No longer used for direct user editing
  },
};

/**
 * Preconfigured LLM parameter presets based on style preference.
 */
export const STYLE_PRESETS: Record<
  StylePreference,
  Pick<LLMSettings, "temperature" | "max_tokens">
> = {
  Concise: { temperature: 0.1, max_tokens: 512 },
  Detailed: { temperature: 0.3, max_tokens: 1536 },
};

export const SETTINGS_KEY = "user_settings";
const API_KEY_KEY = "api_key";
// Key for AES-GCM encryption.
// Note: In a client-side extension without user password, this acts as obfuscation against casual inspection.
const OBFUSCATION_KEY = "openinsight_local_obfuscation";

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
