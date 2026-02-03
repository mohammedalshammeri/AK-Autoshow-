/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-manrope)', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#D4AF37', // A rich gold color
          light: '#EACD6E',
          dark: '#B89B2E',
        },
        background: {
          DEFAULT: '#111111', // A very dark, near-black gray (matte black feel)
          secondary: '#1E1E1E',
        },
        text: {
          primary: '#F5F5F5', // Off-white for better readability
          secondary: '#A0A0A0',
        },
      },
    },
  },
  plugins: [],
};
