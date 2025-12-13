/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003366",
        accent: "#FF6600",
      },
      fontFamily: {
        vazir: ['Vazir', 'sans-serif'],
      },
    },
  },
  plugins: [],
}