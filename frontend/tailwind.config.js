/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High fidelity color palettes
        primary: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c7d7ff',
          300: '#a3bcff',
          400: '#7a97ff',
          500: '#4f68ff', // Accent brand color
          600: '#3843ff',
          700: '#262cd9',
          800: '#1f22b0',
          900: '#1e218c',
          950: '#111252',
        },
        darkbg: {
          900: '#0b0c10', // Deepest background
          800: '#12141c', // Card / sidebar background
          700: '#1f222f', // Interactive elements background
          600: '#2b3042'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(79, 104, 255, 0.45)',
      }
    },
  },
  plugins: [],
}
