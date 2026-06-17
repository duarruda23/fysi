import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11100E",
        coal: "#25211C",
        pearl: "#F8F5EF",
        linen: "#E8DDD0",
        sand: "#CDBEAE",
        gold: "#CCB72F",
        moss: "#6D7B64",
        clay: "#B46D54"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 24px 70px rgba(17, 16, 14, 0.09)",
        line: "0 1px 0 rgba(17, 16, 14, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
