// tailwind.config.ts
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
        rotaract: {
          cranberry: "#D41367", // Signature Rotaract Cranberry/Magenta
          navy: "#002855",      // Rotary Royal Blue / Navy
          gold: "#F7A800",      // Rotary Gold Accent
          dark: "#0B132B",      // Charcoal Navy Dark Neutral
          surface: "#F8FAFC",   // Light Neutral Base Background
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;