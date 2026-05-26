/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        pitch:   { DEFAULT: '#0a1628', light: '#112240', border: '#1e3a5f' },
        green:   { DEFAULT: '#00d084', dark: '#00a868', muted: '#00d08420' },
        amber:   { DEFAULT: '#f59e0b', muted: '#f59e0b20' },
        red:     { DEFAULT: '#ef4444', muted: '#ef444420' },
        slate:   { 400: '#94a3b8', 500: '#64748b', 600: '#475569' },
      },
    },
  },
  plugins: [],
}
