/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          bg: '#050c09',
          card: 'rgba(15, 30, 24, 0.45)',
          forest: '#0c2217',
          green: '#10b981',
          emerald: '#059669',
          teal: '#0d9488',
          blue: '#0284c7',
          indigo: '#4f46e5',
          text: '#f1f5f9',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif']
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
