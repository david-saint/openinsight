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
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)" },
  { id: "anthropic/claude-3-haiku:free", name: "Claude 3 Haiku (Free)" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
];
