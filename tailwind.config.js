/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./*.html"
  ],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /(bg|text|ring|selection:bg|selection:text)-(teal|indigo|rose|amber)-(100|500|900)/,
      variants: ['hover', 'focus', 'selection'],
    }
  ],
  plugins: [],
}

