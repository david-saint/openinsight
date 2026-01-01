/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
        }
      }
    },
  },
  safelist: [
    {
      pattern: /(bg|text|ring|selection:bg|selection:text)-(teal|indigo|rose|amber|accent)-(100|500|600|900)/,
      variants: ['hover', 'focus', 'selection'],
    }
  ],
  plugins: [],
}

