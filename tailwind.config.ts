import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette principale - tons sable et or islamique
        primary: {
          50:  "#fdf8ec",
          100: "#faefc9",
          200: "#f5dc8f",
          300: "#f0c754",
          400: "#ecb22c",
          500: "#e09415",
          600: "#c47210",
          700: "#9d5310",
          800: "#814214",
          900: "#6c3714",
          950: "#3e1c07",
        },
        // Accent vert islamique
        accent: {
          50:  "#f0fdf5",
          100: "#dcfce8",
          200: "#bbf7d1",
          300: "#86efad",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Couleurs secondaires
        sand: {
          50:  "#faf8f4",
          100: "#f3ede2",
          200: "#e8dcc5",
          300: "#d9c5a0",
          400: "#c8a877",
          500: "#ba8f56",
          600: "#ad7a46",
          700: "#91633b",
          800: "#755135",
          900: "#60442e",
          950: "#332217",
        },
      },
      fontFamily: {
        arabic: [
          "Scheherazade New",
          "Amiri",
          "Traditional Arabic",
          "Arial Unicode MS",
          "serif",
        ],
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        "arabic-sm":   ["1.25rem",  { lineHeight: "2rem" }],
        "arabic-md":   ["1.75rem",  { lineHeight: "2.5rem" }],
        "arabic-lg":   ["2.5rem",   { lineHeight: "3.5rem" }],
        "arabic-xl":   ["3.5rem",   { lineHeight: "5rem" }],
        "arabic-2xl":  ["5rem",     { lineHeight: "7rem" }],
        "arabic-3xl":  ["7rem",     { lineHeight: "10rem" }],
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease-in-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "slide-in":   "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "bounce-soft":"bounceSoft 1s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "arabesque":       "url('/assets/patterns/arabesque.svg')",
        "geometric":       "url('/assets/patterns/geometric.svg')",
        "gradient-warm":   "linear-gradient(135deg, #fdf8ec 0%, #f3ede2 50%, #faefc9 100%)",
        "gradient-dark":   "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
