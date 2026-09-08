/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf0',
          100: '#fbf5d5',
          200: '#f6e79d',
          300: '#f0d45a',
          400: '#ebc02a',
          500: '#d4a211',
          600: '#b7800c',
          700: '#925c0e',
          800: '#794912',
          900: '#673c14',
        },
        thai: {
          primary: '#851b2e',
          secondary: '#d4af37',
          dark: '#1e1b18',
          light: '#fdfbf7',
        }
      },
      fontFamily: {
        thai: ['var(--font-prompt)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
