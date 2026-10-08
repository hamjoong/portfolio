/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          900: '#0F172A',
        },
        blue: {
          600: '#2563EB',
        },
        gray: {
          600: '#1E293B',
        },
        red: {
          600: '#EF4444',
        },
        green: {
          600: '#03C75A',
        },
        yellow: {
          400: '#FEE500',
        },
      },
      spacing: {
        '4.5': '1.125rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}

