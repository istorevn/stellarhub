import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",

  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: colors.blue,
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      slate: colors.slate,
      green: colors.green,
      blue: colors.blue,
      sky: colors.sky,
      yellow: colors.amber,
      red: colors.red,
      secondary: colors.yellow,
      amber: colors.amber,
      emerald: colors.emerald,
      indigo: colors.blue,
      zinc: colors.zinc,
      textDefault: '#111827',
      textSecondary: '#4b5563',
      borderDefault: '#4b5563',
      bgDefault: '#e5e7eb',
    },
  },

  plugins: [forms],
};
