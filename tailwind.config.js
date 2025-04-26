/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        wheat: '#f5deb3',
        // Theme colors
        primary: {
          light: '#3b82f6', // blue-500
          dark: '#10b981',  // emerald-500
        },
        secondary: {
          light: '#6366f1', // indigo-500
          dark: '#8b5cf6',  // violet-500
        },
        background: {
          light: '#ffffff',
          dark: '#121212',
        },
        surface: {
          light: '#f3f4f6', // gray-100
          dark: '#1f2937',  // gray-800
        },
        text: {
          light: '#1f2937', // gray-800
          dark: '#f9fafb',  // gray-50
        },
      },
      fontFamily: {
        font3: ['YourFont3', 'sans-serif'],
        font5: ['YourFont5', 'sans-serif'],
        font6: ['YourFont6', 'sans-serif'],
      },
      backgroundImage: {
        'sunset-glow': 'linear-gradient(to right, #fc008f, #c91771, #971c56, #691a3c, #3d1524, #3f1b25, #412027, #422629, #723f3d, #a35d4c, #d17f57, #fba75f);',
        'dark-sunset-glow': 'linear-gradient(to right, #10b981, #059669, #047857, #065f46, #064e3b, #064e3b, #065f46, #047857, #059669, #10b981);',
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
      screens: {
        'xs': '475px',
        // Default Tailwind breakpoints
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
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
