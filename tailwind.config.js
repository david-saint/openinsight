/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,html}", "./*.html"],
  theme: {
    extend: {
      colors: {
        accent: {
          100: "rgb(var(--accent-100) / <alpha-value>)",
          500: "rgb(var(--accent-500) / <alpha-value>)",
          600: "rgb(var(--accent-600) / <alpha-value>)",
          700: "rgb(var(--accent-700) / <alpha-value>)",
          900: "rgb(var(--accent-900) / <alpha-value>)",
        },
      },
    },
  },
  safelist: [
    // Only safelist accent color utilities that use CSS variables (dynamic theming)
    // Static colors (teal/indigo/rose/amber) are tree-shaken from actual code usage
    {
      pattern: /(bg|text|ring|border)-(accent)-(100|400|500|600|700|900)/,
      variants: ["hover", "focus", "dark", "dark:hover"],
    },
    // Selection utilities for accent theme
    "selection:bg-accent-100",
    "selection:text-accent-900",
    // Accent for range inputs
    "accent-accent-500",
  ],
  plugins: [],
};
