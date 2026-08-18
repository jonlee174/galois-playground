/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#f8f3ec",
          100: "#efe3d1",
          200: "#ddc4a3",
          300: "#c9a476",
          400: "#b78957",
          500: "#a1723f",
          600: "#875c34",
          700: "#6c482c",
          800: "#523625",
          900: "#3a271b",
        },
      },
    },
  },
  plugins: [],
};
