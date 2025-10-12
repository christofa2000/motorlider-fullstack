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
        // Branding automotriz Motorlider
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-contrast)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-contrast)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-contrast)",
        },
        neutral: {
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
        },
        // Colores específicos del branding
        brand: {
          warm: "var(--brand-warm)",
          cool: "var(--brand-cool)",
        },
        // Superficies para el tema oscuro
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        "on-surface": "var(--on-surface)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-accent": "pulseAccent 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseAccent: {
          "0%, 100%": { boxShadow: "0 0 0 0 var(--color-accent)" },
          "50%": { boxShadow: "0 0 0 8px transparent" },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [],
};

export default config;

