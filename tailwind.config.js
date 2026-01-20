/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        synth: {
          silver: '#c0c0c0',
          dark: '#1a1a1a',
          panel: '#2d2d2d',
          accent: '#ff6b35',
          led: '#00ff00',
          ledOff: '#003300',
          knob: '#4a4a4a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
