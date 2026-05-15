/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          950: '#04080f',
          900: '#070d1a',
          850: '#0a1220',
          800: '#0d1828',
          700: '#132035',
          600: '#1a2d48',
          500: '#1e3a5f',
        },
      },
    },
  },
  plugins: [],
}
