/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { 300: '#fb7185', 400: '#f43f5e', 500: '#f43f5e', 600: '#e11d48', 900: '#4c0519' },
        zinc: {
          950: '#09090b',
          900: '#18181b',
          850: '#1f1f23',
          805: '#212125',
          800: '#27272a',
          750: '#2e2e32',
          350: '#a1a1aa',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
}