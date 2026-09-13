/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm ivory / editorial studio palette (replaces the old Dark Navy + Purple AI SaaS theme)
        background: '#F7F5EE',
        surface: '#FFFDF8',
        border: '#DEDCD4',
        charcoal: {
          DEFAULT: '#30342F',
          600: '#4B5049',
          500: '#63685F',
          400: '#8B9086',
          300: '#AEB2A7',
        },
        oat: {
          DEFAULT: '#E5DED1',
          50: '#F7F3EA',
          100: '#EFE8D9',
          200: '#E5DED1',
          300: '#D9CEBB',
        },
        brown: {
          DEFAULT: '#9A806C',
          50: '#F4EFEA',
          100: '#E8DDD1',
          300: '#C2AC97',
          500: '#9A806C',
          600: '#87705D',
          700: '#6E5A4A',
        },
        sage: {
          50: '#EEF1EA',
          100: '#E1E6D9',
          200: '#C5CCBC',
          300: '#B4BDA8',
          400: '#A2AC94',
          500: '#899A82',
          600: '#748A6C',
          700: '#5F7359',
          800: '#4C5D47',
          900: '#3A4737',
        },
        forest: {
          50: '#EAF0EC',
          100: '#D2DED6',
          200: '#A9C0AF',
          300: '#7FA187',
          400: '#5A8163',
          500: '#476E4E',
          600: '#405646',
          700: '#324438',
          800: '#28362C',
          900: '#1E2921',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
