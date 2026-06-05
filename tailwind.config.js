/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./screens/**/*.{ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F2",
        paper: "#FAF8F2",
        "paper-2": "#F2EFE5",
        card: "#FFFFFF",
        "card-2": "#FCFBF7",
        primary: "#2F5247",
        forest: "#2F5247",
        "forest-deep": "#223D34",
        secondary: "#6E8C7E",
        moss: "#6E8C7E",
        accent: "#E0A53D",
        gold: "#E0A53D",
        "gold-deep": "#C08527",
        surface: "#FFFFFF",
        ink: "#2B3A33",
        "ink-2": "#5C6B62",
        "ink-3": "#828E86",
        muted: "#5C6B62",
        border: "#E6E2D8",
        present: "#5C8170",
        late: "#D69A3E",
        absent: "#C45B3C",
        excused: "#7186A8",
        warning: "#D69A3E",
        critical: "#C45B3C",
        success: "#5C8170"
      },
      fontFamily: {
        // Outfit is the UI font (body, labels, titles). Fraunces (display) is
        // reserved for hero numerals + rank names, exposed as `font-display`.
        sans: ["Outfit_400Regular"],
        serif: ["Outfit_700Bold"],
        display: ["Fraunces_600SemiBold"],
        medium: ["Outfit_500Medium"],
        semibold: ["Outfit_600SemiBold"],
        bold: ["Outfit_700Bold"]
      },
      boxShadow: {
        card: "0px 4px 10px rgba(34, 61, 52, 0.07)"
      },
      borderRadius: {
        card: "22px"
      }
    }
  },
  plugins: []
};
