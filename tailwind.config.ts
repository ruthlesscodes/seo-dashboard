import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        rank: {
          up: "hsl(142 71% 45%)",
          down: "hsl(0 72% 55%)",
          stable: "hsl(var(--muted-foreground))",
        },
        severity: {
          critical: "hsl(0 72% 55%)",
          warning: "hsl(38 92% 52%)",
          info: "hsl(217 91% 60%)",
        },
        geo: {
          score: "hsl(262 83% 58%)",
          cited: "hsl(142 71% 45%)",
          missing: "hsl(0 72% 55%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "4px",
      },
      /* 13 Animation Rules — Amber Frost Industrial motion system */
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "number-tick": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to: { width: "var(--progress-width, 0%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 8px hsla(38, 92%, 52%, 0.4)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 16px hsla(38, 92%, 52%, 0.2)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "number-tick": "number-tick 0.3s ease-out",
        "progress-fill": "progress-fill 0.8s ease-out forwards",
        "pulse-glow": "pulse-glow 2s infinite",
        "pulse-dot": "pulse-dot 2s infinite",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
