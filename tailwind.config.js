/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        doom: ["DooM", ...defaultTheme.fontFamily.sans],
        accent: ["Xolonium", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
  // plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "retro",
      "synthwave",
      "acid",
      "aqua",
      "autumn",
      "black",
      "bumblebee",
      "business",
      "cmyk",
      "coffee",
      "corporate",
      "cupcake",
      "cyberpunk",
      "dark",
      "dim",
      "dracula",
      "emerald",
      "fantasy",
      "forest",
      "garden",
      "halloween",
      "lemonade",
      "light",
      "lofi",
      "luxury",
      "night",
      "nord",
      "pastel",
      "sunset",
      "valentine",
      "winter",
      "wireframe",
    ],
  },
};
