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
          DEFAULT: "#CC5500", // Rich yellowy-orange with good contrast
          dark: "#A34400", // Darker for better contrast
          light: "#E67300", // Lighter but still accessible
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
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
} satisfies Config;
