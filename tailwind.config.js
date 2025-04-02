/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: '#875cf6', // Equivalent to --clr-primary-a0
        primaryBlur: '#442170',
        surface: '#020108', // Equivalent to --clr-surface-a0
        surface10: '#1e1e23', // Equivalent to --clr-surface-a10
      }
    },
  },
  plugins: [],
}

