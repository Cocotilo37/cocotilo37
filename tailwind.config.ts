import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        racing: {
          red: "#E02020",
          redDark: "#a51616",
          bg: "#0a0a0a",
          surface: "#111111",
          card: "#161616",
          border: "#222222",
          muted: "#2a2a2a",
          text: "#f5f5f0",
          textDim: "#888888",
          green: "#2d9e5f",
          blue: "#1d6fa8",
          yellow: "#e8a020",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(224,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(224,32,32,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "pulse-red": "pulse-red 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(230,57,70,0)" },
          "50%": { boxShadow: "0 0 0 4px rgba(230,57,70,0.2)" },
        },
        slideIn: {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
