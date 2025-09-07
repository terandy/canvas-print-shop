import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#007ACC", // Blue with good contrast
          dark: "#005C99", // Darker blue for better contrast
          light: "#3399FF", // Lighter blue but still accessible
        },
        secondary: {
          DEFAULT: "#1F1A17", // Warmer charcoal
          dark: "#352E2A", // Warm dark gray
        },
        gray: {
          DEFAULT: "#736D68", // Warmer medium gray
          light: "#958F89", // Warmer light gray
        },
        background: {
          DEFAULT: "#F7F6F4", // Warm off-white
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
} satisfies Config;
