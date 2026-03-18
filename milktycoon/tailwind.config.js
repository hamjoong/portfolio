/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Healing 2.5D Palette
        'h-green-light': '#E1F0DA',
        'h-green-base': '#9ADE7B',
        'h-green-deep': '#706233', // Deep wood/grass shadow
        'h-yellow-soft': '#FFFAB7',
        'h-yellow-base': '#FEE8B0',
        'h-orange-warm': '#FFD28F',
        'h-sky-soft': '#EEF5FF',
        'h-sky-base': '#B4D4FF',
        'h-milk': '#FFFFFF',
        'h-cream': '#F9F7C9',
        'h-brown-soft': '#B0926A',
        'h-brown-deep': '#706233',
        'h-text': '#435334', // Dark green-brown for soft text
      },
      boxShadow: {
        '2.5d-sm': '0 4px 0 0 rgba(0, 0, 0, 0.2)',
        '2.5d-md': '0 8px 0 0 rgba(0, 0, 0, 0.2)',
        '2.5d-lg': '0 12px 0 0 rgba(0, 0, 0, 0.2)',
        '2.5d-green': '0 10px 0 0 #609966',
        '2.5d-yellow': '0 10px 0 0 #CA8A04',
        '2.5d-orange': '0 10px 0 0 #B45309',
        '2.5d-blue': '0 10px 0 0 #1D4ED8',
        '2.5d-white': '0 10px 0 0 #E5E7EB',
      },
      fontFamily: {
        'game': ['"Nanum Gothic Round"', 'Pretendard', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'spring-up': 'spring-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'soft-pulse': 'soft-pulse 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'spring-up': {
          '0%': { transform: 'scale(0.5)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
