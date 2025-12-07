/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          teal: '#0E8B86',
          DEFAULT: '#0E8B86',
        },
        cta: {
          green: '#28B99A',
          DEFAULT: '#28B99A',
        },
        light: {
          teal: '#D4F1EE',
        },
        bg: {
          pale: '#F0F4F8',
        },
        accent: {
          blue: '#4AA3C3',
        },
        dark: {
          text: '#102026',
        },
        grey: {
          light: '#F5F7F8',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
