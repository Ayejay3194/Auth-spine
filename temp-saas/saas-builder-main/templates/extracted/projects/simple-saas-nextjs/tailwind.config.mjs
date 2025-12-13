/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#e5e7eb",
        primary: {
          DEFAULT: "#38bdf8",
        },
      },
      borderRadius: {
        lg: "0.75rem",
      },
    },
  },
  plugins: [],
};
