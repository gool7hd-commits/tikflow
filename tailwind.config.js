/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./renderer/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0E1A",
        darkSurface: "#13182C",
        darkCard: "#181E36",
        darkBorder: "rgba(255, 255, 255, 0.08)",
        brandPurple: "#8B5CF6",
        brandPink: "#EC4899",
        brandCyan: "#06B6D4",
        brandGreen: "#10B981"
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
