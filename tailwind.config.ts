import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Piano keys
        ivory: "#FFFFF0",
        ebony: "#1a1a1a",
        // Premium palette
        gold: {
          DEFAULT: "#d4a853",
          light: "#e8c87a",
          dark: "#b8860b",
        },
        cream: {
          DEFAULT: "#f9f6f0",
          dark: "#ebe5d9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(212, 168, 83, 0.3), 0 0 40px rgba(212, 168, 83, 0.1)",
        "glow-gold-sm": "0 0 10px rgba(212, 168, 83, 0.2)",
        "glow-gold-intense": "0 0 30px rgba(212, 168, 83, 0.5), 0 0 60px rgba(212, 168, 83, 0.2)",
        premium: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(212, 168, 83, 0.05)",
        "premium-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 168, 83, 0.05)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #d4a853 0%, #b8860b 100%)",
        "gradient-premium": "linear-gradient(135deg, rgba(212, 168, 83, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
