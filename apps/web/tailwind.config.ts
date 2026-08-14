import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F2FAF6",
          100: "#DCEDE5",
          200: "#B8D8CA",
          600: "#037A58",
          700: "#02553E",
          900: "#013C2D",
          950: "#012E22",
        },
        gold: {
          50: "#FFF8EA",
          100: "#F8E7BF",
          200: "#E4C780",
          500: "#B88327",
          600: "#9F6F20",
          700: "#7F5618",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(1, 60, 45, 0.08)",
      },
    },
  },
  plugins: [animate],
};

export default config;
