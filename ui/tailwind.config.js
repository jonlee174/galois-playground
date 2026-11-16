/** @type {import('tailwindcss').Config} */

// Typeface for everything except MathJax output: Modern No. 20 (see
// public/fonts/README.md for where the file comes from).
const display = ['"Modern No. 20"', "Georgia", "serif"];

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // Sharp, square-edged UI: the whole radius scale collapses to (almost) nothing.
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "1px",
      md: "1px",
      lg: "2px",
      xl: "2px",
      "2xl": "2px",
      "3xl": "2px",
      full: "0",
    },
    fontFamily: {
      sans: display,
      serif: display,
      mono: display,
      display,
      // Wordmark only. Academy Engraved LET ships with macOS.
      title: ['"Academy Engraved LET"', '"AcademyEngravedLetPlain"', ...display],
    },
    extend: {
      colors: {
        // Warm neutral greys (replaces Tailwind's blue-tinted `gray`).
        gray: {
          50: "#f6f4f1",
          100: "#ebe7e1",
          200: "#d6d0c7",
          300: "#b8b0a5",
          400: "#958d82",
          500: "#736c63",
          600: "#57514a",
          700: "#3f3b36",
          800: "#2b2825",
          900: "#1c1a18",
          950: "#100f0e",
        },
        // Tan accent.
        accent: {
          50: "#f8f3ec",
          100: "#efe3d1",
          200: "#e2ccad",
          300: "#d2b48a",
          400: "#c19d6c",
          500: "#a8834f",
          600: "#8a6a3e",
          700: "#6c5231",
          800: "#4f3c25",
          900: "#352819",
        },
        // Errors in a muted brick so they stay inside the warm palette.
        red: {
          200: "#e6c2b4",
          300: "#d49e88",
          400: "#bf7a60",
          700: "#7e3d2a",
          900: "#43221a",
          950: "#26130e",
        },
      },
    },
  },
  plugins: [],
};
