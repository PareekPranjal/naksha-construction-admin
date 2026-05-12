import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E0E0E",
        paper: "#FAFAF7",
        rule: "#E5E5E0",
        muted: "#6B7280",
        accent: "#C2410C",
        accentHi: "#9A3412",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
