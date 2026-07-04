import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/store/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9f9f9",
        surface: "#ffffff",
        bone: "#FBFBFB",
        "surface-container": "#eeeeee",
        primary: "#000000",
        "on-primary": "#ffffff",
        secondary: "#5d5e60",
        "text-secondary": "#848484",
        tertiary: "#000000",
        border: "#e8e8e8",
        error: "#ba1a1a",
        outline: "#7e7576",
        "editorial-red": "#AE0200",
      },
      fontFamily: {
        serif: ["EB Garamond", "serif"],
        sans: ["Hanken Grotesk", "sans-serif"],
      },
      spacing: {
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        gutter: "24px",
        "section-gap": "120px",
      },
      maxWidth: {
        container: "1440px",
      },
      borderRadius: {
        sm: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      fontSize: {
        // Label caps: 0.75rem, 0.085em letter-spacing, uppercase
        "label-caps": [
          "0.75rem",
          { lineHeight: "1.2", letterSpacing: "0.085em", fontWeight: "600" },
        ],
        "label-caps-lg": [
          "0.8125rem",
          { lineHeight: "1.2", letterSpacing: "0.085em", fontWeight: "600" },
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "spin-slow": "spin 1.5s linear infinite",
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
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
