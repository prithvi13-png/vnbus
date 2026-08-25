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
          300: "#7FB49F",
          500: "#0C8C69",
          600: "#037A58",
          700: "#02553E",
          800: "#024A37",
          900: "#013C2D",
          950: "#012E22",
        },
        gold: {
          50: "#FFF8EA",
          100: "#F8E7BF",
          200: "#E4C780",
          300: "#D5AE5B",
          400: "#C5943C",
          500: "#B88327",
          600: "#9F6F20",
          700: "#7F5618",
        },
        pearl: {
          50: "#FCFBF7",
          100: "#F7F1E6",
          200: "#EADBC4",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(1, 60, 45, 0.08)",
        premium: "0 18px 60px rgba(1, 60, 45, 0.12)",
        panel: "0 10px 34px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [animate],
};

export default config;
