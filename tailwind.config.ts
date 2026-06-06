import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          ink: "#f6f8fb",
          panel: "#ffffff",
          panelSoft: "#f8fafc",
          line: "#e2e8f0",
          text: "#0f172a",
          muted: "#64748b",
          cyan: "#0ea5e9",
          lime: "#22c55e",
          pink: "#ec4899",
          amber: "#f59e0b"
        }
      },
      boxShadow: {
        glow: "0 12px 36px rgba(14, 165, 233, 0.18)",
        panel: "0 20px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
