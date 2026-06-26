/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#050505',
          900: '#050505',
          800: '#0D0D0D',
          700: '#141414',
          600: '#1A1A1A',
          500: '#222222',
          400: '#2A2A2A',
          300: '#333333',
        },
        gold: {
          DEFAULT: '#B59A63',
          900: '#6B5B35',
          800: '#8A7248',
          700: '#9E845A',
          600: '#B59A63',
          500: '#C8B07D',
          400: '#D4C09A',
          300: '#E2D5BA',
          200: '#EDE5D0',
          100: '#F6F1E7',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.3em',
        'ultra-wide': '0.5em',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
      },
    },
  },
  plugins: [],
};
