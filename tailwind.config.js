/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#00ff41',
          'green-dark': '#00cc33',
          'green-dim': '#00ff4180',
          'green-border': '#00ff4133',
          black: '#000000',
          'black-light': '#0a0a0a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'pulse-red': 'pulse-red 1s infinite',
        'flicker': 'flicker 3s infinite alternate',
        'loading': 'loading 1.5s infinite',
      }
    },
  },
  plugins: [],
}
