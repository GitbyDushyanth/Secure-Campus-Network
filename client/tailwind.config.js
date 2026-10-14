/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg: '#080D1A',
          card: '#0F172A',
          surface: '#162036',
          border: '#1E2E4A',
          muted: '#64748B',
          admin: '#06B6D4',
          faculty: '#3B82F6',
          student: '#10B981',
          lab: '#F59E0B',
          guest: '#F43F5E'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
