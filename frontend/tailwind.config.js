/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        game: ['Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast':  'pulse 1s infinite',
        'wiggle':      'wiggle 0.5s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-5deg)' },
          '50%':     { transform: 'rotate(5deg)'  },
        },
      },
    },
  },
  plugins: [],
};
