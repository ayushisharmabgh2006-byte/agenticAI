/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0c0e11",
        panel: "#14171b",
        panel2: "#1c2026",
        line: "#262b32",
        muted: "#8a94a0",
        acid: "#c7f36b",
        "acid-dark": "#9acc3b",
        cyan: "#5eead4",
        purple: "#c084fc",
        rose: "#fb7185",
        amber: "#fbbf24"
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
        grotesk: ["'Space Grotesk'", "sans-serif"]
      }
    },
  },
  plugins: [],
};
