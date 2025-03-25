/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "verde-obscuro": "#4e6b66",
        crema: "#ebe1c5",
        "azul-obscuro": "#577590",
      },
    },
  },
  plugins: [],
};
