/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wheat: '#f5deb3',
      },
      fontFamily: {
        font3: ['YourFont3', 'sans-serif'],
        font5: ['YourFont5', 'sans-serif'],
        font6: ['YourFont6', 'sans-serif'],
      },
      backgroundImage: {
        'sunset-glow': 'linear-gradient(to right, #fc008f, #c91771, #971c56, #691a3c, #3d1524, #3f1b25, #412027, #422629, #723f3d, #a35d4c, #d17f57, #fba75f);',
      },
      backgroundSize: {
        '400': '400% 400%',
      },
      animation: {
        'bg-move': 'gradientMove 10s ease infinite',
      },
      keyframes: {
        gradientMove: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-shadow-red': {
          'text-shadow': '14px 2px #ff0000',
        },
        '.text-shadow-white': {
          'text-shadow': '14px 2px #ffffff',
        },
        '.text-stroke': {
          '-webkit-text-stroke-width': '1px',
          '-webkit-text-stroke-color': 'black',
        },
        '.text-stroke-dark': {
          '-webkit-text-stroke-width': '1px',
          '-webkit-text-stroke-color': '#1d1d1d',
        },
      });
    }),
  ],
};
