import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Pacific Northwest forest green — primary brand color
        forest: {
          50:  '#edf4f0',
          100: '#ccddd5',
          200: '#9cbdac',
          300: '#6a9c82',
          400: '#3d7a5d',
          500: '#255c42',
          600: '#1a4a33',
          700: '#123825',
          800: '#0b2618',
          900: '#05150d',
        },
        // Puget Sound slate blue — secondary
        sound: {
          50:  '#eef3f6',
          100: '#d0dde5',
          200: '#a2bcca',
          300: '#7299ae',
          400: '#4a7991',
          500: '#2f5d72',
          600: '#234b5c',
          700: '#183945',
          800: '#0e272e',
          900: '#071519',
        },
        // Golden-hour amber/ochre — highlights
        amber: {
          50:  '#fdf6ec',
          100: '#fae9cc',
          200: '#f4d09a',
          300: '#ebb162',
          400: '#dc8e30',
          500: '#c07018',
          600: '#9c5410',
          700: '#783c0c',
          800: '#542808',
          900: '#361604',
        },
        // Weathered terracotta — accent
        terra: {
          50:  '#f9eeed',
          100: '#f0d3ce',
          200: '#e0a89e',
          300: '#ce7565',
          400: '#b04a3a',
          500: '#943228',
          600: '#782018',
          700: '#5c1410',
          800: '#400c08',
          900: '#280604',
        },
        // Warm cream/parchment — backgrounds
        parchment: {
          50:  '#fdfaf3',
          100: '#f7f0e2',
          200: '#ede4cf',
          300: '#ddd0ac',
          400: '#c8b888',
          500: '#b09a60',
        },
      },
      fontFamily: {
        // Lora is a serif font used intentionally as the default body font.
        // Mapped to `sans` so Tailwind's default body styling applies it automatically.
        sans:    ['Lora', 'Georgia', 'serif'],
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(101,65,20,0.09), 0 1px 2px rgba(101,65,20,0.06)',
        'warm':    '0 2px 8px rgba(101,65,20,0.10), 0 1px 3px rgba(101,65,20,0.06)',
        'warm-md': '0 4px 16px rgba(101,65,20,0.11), 0 2px 4px rgba(101,65,20,0.07)',
        'warm-lg': '0 10px 32px rgba(101,65,20,0.14), 0 4px 10px rgba(101,65,20,0.08)',
      },
      animation: {
        'scroll-left': 'scroll-left 25s linear infinite',
        'fade-in':     'fadeIn 200ms ease-out',
        'slide-up':    'slideUp 300ms ease-out',
        'slide-down':  'slideDown 300ms ease-out',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
