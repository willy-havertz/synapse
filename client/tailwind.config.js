import tailwindScrollbar from "tailwind-scrollbar";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@fortawesome/fontawesome-svg-core/styles.css",
  ],
  safelist: [
    "svg-inline--fa",
    /^fa-/,
    /^fa-.*-?x$/,
    /^fa-rotate-/,
    "fa-spin",
    "fa-pulse",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#8A4FFF",
          DEFAULT: "#7B3FF5",
          dark: "#6C2ED5",
        },
        bg: {
          DEFAULT: "#F9FAFB",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.05)",
      },
      spacing: {
        7: "1.75rem",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [
    tailwindScrollbar,
  ],
};
