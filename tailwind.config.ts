import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1536px",
      },
    },
    extend: {
      colors: {
        // Gandhi Fellowship Brand Colors - Professional Palette
        brand: {
          // Primary: Grey (#344354)
          primary: "#344354",
          "primary-50": "#F5F6F7",
          "primary-100": "#E8EAEC",
          "primary-200": "#D1D5D9",
          "primary-300": "#B4BAC2",
          "primary-400": "#8F97A3",
          "primary-500": "#344354",
          "primary-600": "#2A3643",
          "primary-700": "#1F2937",
          "primary-800": "#151B26",
          "primary-900": "#0A0E14",
          
          // Secondary: Green (#71B941)
          secondary: "#71B941",
          "secondary-50": "#F0F9EC",
          "secondary-100": "#D9F2CC",
          "secondary-200": "#B8E5A0",
          "secondary-300": "#8FD66A",
          "secondary-400": "#71B941",
          "secondary-500": "#5A9A35",
          "secondary-600": "#467B2A",
          "secondary-700": "#355C20",
          "secondary-800": "#253D16",
          "secondary-900": "#151E0D",
          
          // Accent: Orange (#F24F00)
          accent: "#F24F00",
          "accent-50": "#FFF4F0",
          "accent-100": "#FFE0D1",
          "accent-200": "#FFC1A3",
          "accent-300": "#FF9A70",
          "accent-400": "#F24F00",
          "accent-500": "#CC3F00",
          "accent-600": "#A63200",
          "accent-700": "#802600",
          "accent-800": "#591A00",
          "accent-900": "#330D00",
          
          // Neutral backgrounds
          light: "#F8F9FA",
          "light-warm": "#FEF9F6",
          "light-cool": "#F5F7F9",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#344354",
          foreground: "#ffffff",
          50: "#F5F6F7",
          100: "#E8EAEC",
          200: "#D1D5D9",
          300: "#B4BAC2",
          400: "#8F97A3",
          500: "#344354",
          600: "#2A3643",
          700: "#1F2937",
          800: "#151B26",
          900: "#0A0E14",
        },
        secondary: {
          DEFAULT: "#71B941",
          foreground: "#ffffff",
          50: "#F0F9EC",
          100: "#D9F2CC",
          200: "#B8E5A0",
          300: "#8FD66A",
          400: "#71B941",
          500: "#5A9A35",
          600: "#467B2A",
          700: "#355C20",
          800: "#253D16",
          900: "#151E0D",
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
          DEFAULT: "#F24F00",
          foreground: "#ffffff",
          50: "#FFF4F0",
          100: "#FFE0D1",
          200: "#FFC1A3",
          300: "#FF9A70",
          400: "#F24F00",
          500: "#CC3F00",
          600: "#A63200",
          700: "#802600",
          800: "#591A00",
          900: "#330D00",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [import("tailwindcss-animate")],
} satisfies Config;
