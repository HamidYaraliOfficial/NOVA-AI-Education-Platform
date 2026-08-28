import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ui)", "Segoe UI Variable", "Segoe UI", "system-ui", "sans-serif"],
        fa: ["var(--font-fa)", "Vazirmatn", "Segoe UI", "Tahoma", "sans-serif"],
        zh: ["var(--font-zh)", "Microsoft YaHei", "PingFang SC", "Segoe UI", "sans-serif"]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))"
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px"
      },
      boxShadow: {
        acrylic: "0 8px 28px -6px rgba(0,0,0,0.18), 0 2px 8px -2px rgba(0,0,0,0.12)",
        fluent: "0 1px 2px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.06)"
      },
      backdropBlur: { fluent: "24px" },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "reveal-x": { from: { width: "0%" }, to: { width: "var(--target-w)" } }
      },
      animation: {
        "fade-in": "fade-in .35s ease-out",
        "reveal-x": "reveal-x 1s cubic-bezier(.22,1,.36,1)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
