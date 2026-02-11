import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-bg))",
          hover: "hsl(var(--sidebar-bg-hover))",
          active: "hsl(var(--sidebar-bg-active))",
          fg: "hsl(var(--sidebar-fg))",
          "fg-active": "hsl(var(--sidebar-fg-active))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent-color))",
        },
        badge: {
          "blue-bg": "hsl(var(--badge-blue-bg))",
          "blue-fg": "hsl(var(--badge-blue-fg))",
          "blue-border": "hsl(var(--badge-blue-border))",
          "green-bg": "hsl(var(--badge-green-bg))",
          "green-fg": "hsl(var(--badge-green-fg))",
          "green-border": "hsl(var(--badge-green-border))",
          "yellow-bg": "hsl(var(--badge-yellow-bg))",
          "yellow-fg": "hsl(var(--badge-yellow-fg))",
          "yellow-border": "hsl(var(--badge-yellow-border))",
          "red-bg": "hsl(var(--badge-red-bg))",
          "red-fg": "hsl(var(--badge-red-fg))",
          "red-border": "hsl(var(--badge-red-border))",
          "purple-bg": "hsl(var(--badge-purple-bg))",
          "purple-fg": "hsl(var(--badge-purple-fg))",
          "purple-border": "hsl(var(--badge-purple-border))",
          "gray-bg": "hsl(var(--badge-gray-bg))",
          "gray-fg": "hsl(var(--badge-gray-fg))",
          "gray-border": "hsl(var(--badge-gray-border))",
        },
        surface: {
          raised: "hsl(var(--surface-raised))",
          code: "hsl(var(--surface-code))",
        },
        toggle: {
          active: "hsl(var(--toggle-active))",
          inactive: "hsl(var(--toggle-inactive))",
        },
        rule: {
          accent: "hsl(var(--rule-accent))",
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
