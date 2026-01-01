export const THEME_COLORS = {
  teal: {
    name: "Teal",
    ring: "ring-teal-500",
    bg: "bg-teal-500",
  },
  indigo: {
    name: "Indigo",
    ring: "ring-indigo-500",
    bg: "bg-indigo-500",
  },
  rose: {
    name: "Rose",
    ring: "ring-rose-500",
    bg: "bg-rose-500",
  },
  amber: {
    name: "Amber",
    ring: "ring-amber-500",
    bg: "bg-amber-500",
  },
} as const;

export type ThemeColor = keyof typeof THEME_COLORS;

export const MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B" },
  { id: "meta-llama/llama-3.1-405b-instruct:free", name: "Llama 3.1 405B" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 405B" },
  { id: "mistralai/devstral-2512:free", name: "Mistral Devstral" },
];
